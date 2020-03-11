'use strict';

const expect = require('expect.js');

const kansuu = require('kansuu.js'),
  pair = kansuu.pair,
  array = kansuu.array,
  chars = kansuu.chars;

const readlineSync = require('readline-sync');

const Hyouka = require('hyouka.js'),
  Env =  Hyouka.Env,
  Exp =  Hyouka.Exp,
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  State = Monad.State,
  ST = Monad.ST,
  Reader = Monad.Reader,
  Parser = Monad.Parser,
  Cont = Monad.Cont,
  IO = Monad.IO,
  ID = Monad.ID;


const Lispy = {
  Context: {
    // lookup: STRING -> State Maybe[VALUE]
    lookup: (key) => {
      return State.state(env => {
        return Env.lookup(key)(env);
      });
    },
    // extend: (STRING, VALUE) -> State Env
    extend: (key, value) => {
      return State.state(env => {
        return Env.extend(key, value)(env);
      });
    }
  },
  // Semantics: Hyouka.Semantics,
  Semantics: {
    // 2項演算の評価 
    binary: (operator) => (expL, expR) => (env) => {
      return Maybe.flatMap(State.eval(Cont.eval(Lispy.Semantics.evaluate(expL)(Lispy.Semantics.pattern)))(env))(valueL => {
        return Maybe.flatMap(State.eval(Cont.eval(Lispy.Semantics.evaluate(expR)(Lispy.Semantics.pattern)))(env))(valueR => {
          return Maybe.just(operator(valueL,valueR)); 
        });
      });
    },
    pattern: {
      // 数値の評価
      num: (value) => { 
        return State.state(env => {
          return pair.cons(Maybe.just(value), env); 
        });
      },
      // 未定義の評価
      dummy: (_) => { 
        return State.state(env => {
          return pair.cons(Maybe.just(undefined), env); 
        });
      },
      // 真理値の評価
      bool: (value) => { 
        return State.state(env => {
          return pair.cons(Maybe.just(value), env); 
        });
      },
      // 変数の評価
      variable: (name) => {
        return State.state(env => {
          return pair.cons(Env.lookup(name)(env), env); 
        });
      },
      // リスト型の評価
      list: (values) => { 
        return State.state(env => {
          return array.match(values, {
            empty: () => {
              return pair.cons(Maybe.just([]), env); 
            },
            cons: (head, tail) => {
              return Maybe.flatMap(State.eval(Cont.eval(Lispy.Semantics.evaluate(head)(Lispy.Semantics.pattern)))(env))(first => {
                const items = array.foldl(tail)([first])(item => {
                  return (accumulator) => {
                    return Maybe.flatMap(State.eval(Cont.eval(Lispy.Semantics.evaluate(item)(Lispy.Semantics.pattern)))(env))(value => {
                      return array.snoc(value,  accumulator)
                    });
                  };
                });
                return pair.cons(Maybe.just(items), env); 
              });
            }
          });
        });
      },
      //  足し算の評価 
      add: (expL, expR) => {
        const operator = (operandL, operandR) => {
          return operandL + operandR; 
        };
        return State.state(env => {
          return pair.cons(Lispy.Semantics.binary(operator)(expL, expR)(env), env);
        });
      },
      // 引き算の評価 
      subtract: (expL, expR) => {
        return Semantics.subtract(expL, expR)(env);
      },
      /* 関数定義（λ式）の評価  */
      // lambda:: (Var, Exp) -> State[Maybe[FUN[VALUE -> Reader[Maybe[VALUE]]]]]
      lambda: (identifier, body) => {
        return State.state(env => {
          return Exp.match(identifier,{
            variable: (name) => {
              const closure = (actualArg => {
                const localEnv = Env.extend(name, actualArg)(env);
                return State.eval(Cont.eval(Lispy.Semantics.evaluate(body)(Lispy.Semantics.pattern)))(localEnv);
              });
              return pair.cons(Maybe.just(closure), env); 
            }
          });
        });
      },
      /* 関数適用の評価 */
      // app: (Exp, Exp) -> State[Maybe[Value]]
      app: (operator, operand) => {
        return State.state(env => {
          return Maybe.flatMap(State.eval(Cont.eval(Lispy.Semantics.evaluate(operator)(Lispy.Semantics.pattern)))(env))(closure => {
            return Maybe.flatMap(State.eval(Cont.eval(Lispy.Semantics.evaluate(operand)(Lispy.Semantics.pattern)))(env))(actualArg => {
              return pair.cons(closure(actualArg), env); 
            });
          });
        });
      },
    },
    evaluator: (pattern) => {
      return (anExp) => {
        return Lispy.Semantics.evaluate(anExp)(pattern);
      };
    },
    // evaluate: EXP -> Cont[State[Maybe[VALUE]]]
    evaluate: (anExp) => (pattern) => {
      return Cont.unit(Exp.match(anExp,pattern));
    }
  },
  REPL: {
    // read: () => IO[STRING]
    read: () => {
      return IO.unit(readlineSync.question("lispy"));
    },
    // eval: (STRING) => Maybe[VALUE]
    eval: (evaluator) => (input) => {
      // Lispy.Context
      // return Cont.eval(evaluator(environment)(inputString));
    },
    // print: () => IO[]
    print: () => {
    },
    // run: CONTEXT -> Cont[IO]
    run: (context) => {

    }
  },
  Syntax: {
    // expression: () -> PARSER
    expression: (_) => {
      return Parser.alt(Lispy.Syntax.value(), 
        Parser.alt(Lispy.Syntax.lambda(), 
          Parser.alt(Lispy.Syntax.app(), 
            Lispy.Syntax.variable())));
    },
    value: () => {
      return Parser.alt(Lispy.Syntax.atom(),Lispy.Syntax.list());
    },
    atom: () => {
      return Parser.alt(Lispy.Syntax.number(),Lispy.Syntax.bool());
    },
    number: () => {
      return Parser.flatMap(Parser.numeric())(value => {
        return Parser.unit(Exp.num(value));
      });
    },
    bool: (_) => {
      return Parser.alt(
        Parser.token(Parser.flatMap(Parser.chars("#t"))(_ => {
          return Parser.unit(Exp.bool(true));
        })), 
        Parser.token(Parser.flatMap(Parser.chars("#f"))(_ => {
          return Parser.unit(Exp.bool(false));
        }))
      );
    },
    list: () => {
      const open = Parser.char("["), close = Parser.char("]");
      const contents = (_) => {
        const many = (p) => {
          return Parser.alt(
            Parser.flatMap(p)(x => {
              return Parser.flatMap(many(p))(xs => {
                return Parser.unit(array.cons(x,xs));
              });
            })
            ,Parser.unit([])
          );
        };
        return Parser.flatMap(many(Lispy.Syntax.expression()))(expressions => {
          return Parser.unit(expressions);
          // return Parser.unit(Exp.list(expressions));
        });
      };
      // const contents = () => {
      //   return Parser.sepBy(Lispy.Syntax.expression())(separator);
      // };
      return Parser.flatMap(open)(_ => {
        return Parser.flatMap(contents())(contents => {
          return Parser.flatMap(close)(_ => {
            return Parser.unit(Exp.list(contents));
          });
        });
      });
    },
    // SYNTAX.variable
    // variable:: () -> PARSER[String]
    variable: () => {
      const ident = () => { 
        const operator = (_) => {
          const isOperator = (x) => {
            if(x.match(/^[+-=~^~*\/%$#!&<>?_\\]/)){
              return true;
            } else {
              return false;
            } 
          };
          return Parser.sat(isOperator);
        };
        // return Parser.alt(Parser.letter(), operator());
        return Parser.flatMap(Parser.alt(Parser.letter(), operator()))(x => {
          return Parser.flatMap(Parser.many(Parser.alphanum()))(xs => {
            expect(xs).to.a('string');
            return Parser.unit(chars.cons(x, xs));
          });
        });
      };
      const identifier = (_) => {
        const keywords = ["(", ")", "{", "}", ",",";",":","[","]"];
        return Parser.token(Parser.flatMap(ident())(xx => {
          if(array.elem(keywords)(xx)) {
            return Parser.fail(`${xx} is a reserved keyword!`);
          } else {
            return Parser.unit(xx);
          }
        }));
      };
      return Parser.token(Parser.flatMap(identifier())(name => {
        return Parser.unit(Exp.variable(name));
      }))
    },
    // LISP.SYNTAX.lambda
    // (\x body)
    // <x body>
    lambda: () => {
      const open = Parser.char("{"), close = Parser.char("}"), slash = Parser.char("\\"); 
      const parameter = (_) => {
        return Parser.flatMap(Parser.ident())(name => {
          return Parser.unit(name);
        });
      };
      return Parser.flatMap(open)(_ => { 
        //return Parser.flatMap(Parser.token(open))(_ => { 
        return Parser.flatMap(parameter())(name => {
          return Parser.flatMap(Parser.token(Lispy.Syntax.expression()))(body => {
            return Parser.flatMap(close)(_ => {
              return Parser.unit(Exp.lambda(Exp.variable(name), body));
            })
          })
        });
      });
    },
    // LISP.PARSER#application
    // (operator operands)
    // ({x body} operands)
    app: (_) => {
      const open = Parser.char("("), close = Parser.char(")"); 
      const operator = (_) => {
        return Parser.alt( 
          Lispy.Syntax.variable(), // 変数
          Parser.alt( 
            Lispy.Syntax.lambda(), // λ式
            Parser.flatMap(Parser.bracket(open, Lispy.Syntax.app, close))(app => {
              return Parser.unit(app);
            })
          )
        );
      };
      const operands = (_) => {
        const many = (p) => {
          return Parser.alt(
            Parser.flatMap(p)(x => {
              return Parser.flatMap(many(p))(xs => {
                return Parser.unit(array.cons(x,xs));
              });
            })
            ,Parser.unit([])
          );
        };
        return Parser.flatMap(many(Lispy.Syntax.expression()))(expressions => {
          return Parser.unit(expressions);
        });
      };
      return Parser.flatMap(open)(_ => {
        return Parser.flatMap(operator())(operator => {
          return Parser.flatMap(operands())(args => {
            return Parser.flatMap(close)(_ => {
              return Exp.match(operator, {
                variable: (name) => { // e.g.  (add 1 2) => (\x -> (\x -> add(arg1)))(arg2)
                  const fun = Exp.variable(name);
                  // 引数なしの関数適用、例えば today() の場合
                  if(array.isEmpty(args)) {
                    const application = Exp.app(fun, Exp.dummy())
                    return Parser.unit(application);
                  } else {
                    const application = array.foldl(args)(fun)(arg => {
                      return (accumulator) => {
                        return Exp.app(accumulator, arg)
                      };
                    });
                    return Parser.unit(application);
                  }
                },
                lambda: (variable, body) => {
                  const application = array.foldr(args)(Exp.lambda(variable, body))(arg => {
                    return (accumulator) => {
                      return Exp.app(accumulator, arg)
                    };
                  });
                  return Parser.unit(application);
                },
                app: (operator, operands) => {
                  return Parser.unit(Exp.app(operator, operands));
                }
              });
            })
          })
        })
      });
    },
  },
  Env: {
    extraEnv: [
      pair.cons('cons', (head) => {
        return Maybe.just(tail => {
          return Maybe.just(array.cons(head, tail)); 
        });
      }),
      pair.cons('+', (n) => {
        return Maybe.just(m => {
          return Maybe.just(n + m); 
        });
      }),
      pair.cons('-', (n) => {
        return Maybe.just(m => {
          return Maybe.just(n - m); 
        });
      }),
      pair.cons('print', (message => {
        return Maybe.just(message); 
      }))
    ],
    prelude: (_) => {
      return Env.prelude(Lispy.Env.extraEnv)
    }
  }
}



module.exports = Lispy;
