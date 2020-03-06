'use strict';

/*
 * symple untyped lambda calculus interpreter
 *
 */

const fs = require('fs'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  pair = kansuu.pair,
  array = kansuu.array,
  chars = kansuu.chars;

const Hyouka = require('hyouka.js'),
  Exp =  Hyouka.Exp,
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  State = Monad.State,
  Reader = Monad.Reader,
  Parser = Monad.Parser,
  Cont = Monad.Cont,
  IO = Monad.IO,
  ID = Monad.ID;


const Syntax = {
  // expression: () -> PARSER
  expression: (_) => {
    return Parser.alt(Syntax.value(), 
      Parser.alt(Syntax.lambda(), 
        Parser.alt(Syntax.app(), 
          Syntax.variable())));
  },
  value: () => {
    return Parser.alt(Syntax.atom(),Syntax.list());
  },
  atom: () => {
    return Parser.alt(Syntax.number(),Syntax.bool());
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
      return Parser.flatMap(many(Syntax.expression()))(expressions => {
        return Parser.unit(expressions);
        // return Parser.unit(Exp.list(expressions));
      });
    };
    // const contents = () => {
    //   return Parser.sepBy(Syntax.expression())(separator);
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
      // return Parser.flatMap(Parser.token(slash))(_ => {
      //   return Parser.flatMap(Parser.ident())(name => {
      //     return Parser.unit(name);
      //   });
      // });
    };
    return Parser.flatMap(open)(_ => { 
    //return Parser.flatMap(Parser.token(open))(_ => { 
      return Parser.flatMap(parameter())(name => {
        return Parser.flatMap(Parser.token(Syntax.expression()))(body => {
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
        Syntax.variable(), // 変数
        Parser.alt( 
          Syntax.lambda(), // λ式
          Parser.flatMap(Parser.bracket(open, Syntax.app, close))(app => {
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
      return Parser.flatMap(many(Syntax.expression()))(expressions => {
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
};

/*
 * 評価器
 */

const Semantics = Hyouka.Semantics,
  Interpreter = Hyouka.Interpreter;

//
// repl:: Env -> Cont[IO]
const Repl = (environment) => {
  // const Semantics = require('../lib/semantics.js');
  const Evaluator = Interpreter(Syntax.expression, Semantics.evaluator);
  const inputAction = (prompt) => {
    const readlineSync = require('readline-sync');
    return IO.unit(readlineSync.question(prompt));
  };


  return Cont.callCC(exit => {
    // loop:: Null -> IO
    const loop = (environment) => {
      return IO.flatMap(inputAction("\nlispy> "))(inputString  => {
        return IO.flatMap(IO.putString(inputString))(_ => {
          if(inputString === 'exit') {
            return exit(IO.done(_));
          } else {
            return Maybe.match(Cont.eval(Evaluator(environment)(inputString)),{
              nothing: (message) => {
                return IO.flatMap(IO.putString(`\nnothing: ${message}`))(_ => {
                  return loop(environment); 
                });
              },
              just: (value) => {
                return IO.flatMap(IO.putString(`\n${value}`))(_ => {
                  return loop(environment); 
                });
              }
            })
          }
        });
      });
    };
    return Cont.unit(loop(environment))
  });
};

/* 
 * 環境 Environment
 */
const Env = Hyouka.Env;

const extraEnv = [
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
];
const environment = Env.prelude(extraEnv);


IO.run(Cont.eval(Repl(environment)))

