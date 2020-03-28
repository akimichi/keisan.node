"use strict";

const fs = require('fs'),
  util = require('util'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
  Exp = Hyouka.Exp,
  Env = Hyouka.Env,
  Monad = Hyouka.Monad,
  Cont = Monad.Cont,
  State = Monad.State,
  ST = Monad.ST,
  Maybe = Monad.Maybe,
  Parser = Monad.Parser;



// ### Lispyのテスト
describe("Lispyをテストする",() => {
  describe("Lispy.Semanticsをテストする",() => {
    const Semantics = require("../../lib/lispy").Semantics;
    const one = Exp.num(1), two = Exp.num(2),x = Exp.variable('x'),y = Exp.variable('y'),
      emptyEnv = Env.empty();
    describe("evaluatorをテストする",() => {
      const evaluator = Semantics.evaluate(Semantics.definition);
      it("evaluator(Exp.num)", function(done) {
        const number = Exp.num(2); 
        Maybe.match(State.eval(Cont.eval(evaluator(number)))(emptyEnv), {
          just: (result) => {
            expect(result).to.eql(2)
            done();
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
      describe("演算を評価する evaluate operator expression",() => {
        describe("equal式を評価する evaluate equal expression",() => {
          it("evaluator(Exp.equal(2,1)) => false", function(done) {
            const eq = Exp.equal(two, one); 
            Maybe.match(State.eval(Cont.eval(evaluator(eq)))(emptyEnv), {
              just: (result) => {
                expect(result).to.eql(false)
                done();
              },
              nothing: (message) => {
                expect().to.fail()
                done();
              }
            });
          })
          it("evaluator(Exp.equal(1,1)) => true", function(done) {
            const eq = Exp.equal(one, one); 
            Maybe.match(State.eval(Cont.eval(evaluator(eq)))(emptyEnv), {
              just: (result) => {
                expect(result).to.eql(true)
                done();
              },
              nothing: (message) => {
                expect().to.fail()
                done();
              }
            });
          })
        })
        describe("greaterを評価する evaluate greater expression",() => {
          it("evaluator(Exp.greater(2,1)) => true", function(done) {
            const greater = Exp.greater(two, one); 
            Maybe.match(State.eval(Cont.eval(evaluator(greater)))(emptyEnv), {
              just: (result) => {
                expect(result).to.eql(true)
                done();
              },
              nothing: (message) => {
                expect().to.fail()
                done();
              }
            });
          })
          it("evaluator(Exp.greater(1,2)) => true", function(done) {
            const greater = Exp.greater(one, two); 
            Maybe.match(State.eval(Cont.eval(evaluator(greater)))(emptyEnv), {
              just: (result) => {
                expect(result).to.eql(false)
                done();
              },
              nothing: (message) => {
                expect().to.fail()
                done();
              }
            });
          })
        })
        describe("addを評価する evaluate add expression",() => {
          it("evaluator(Exp.add(1,2)) => 3", function(done) {
            const add = Exp.add(one, two); 
            Maybe.match(State.eval(Cont.eval(evaluator(add)))(emptyEnv), {
              just: (result) => {
                expect(result).to.eql(3)
                done();
              },
              nothing: (message) => {
                expect().to.fail()
                done();
              }
            });
          })
        })
        describe("subtractを評価する evaluate subtract expression",() => {
          it("evaluator(Exp.add(2,1)) => 1", function(done) {
            const subtract = Exp.subtract(two, one); 
            Maybe.match(State.eval(Cont.eval(evaluator(subtract)))(emptyEnv), {
              just: (result) => {
                expect(result).to.eql(1)
                done();
              },
              nothing: (message) => {
                expect().to.fail()
                done();
              }
            });
          })
        })
      })
      describe("真理値を評価する evaluate bool expression",() => {
        it("evaluator(Exp.bool)", function(done) {
          const bool = Exp.bool(true); 
          Maybe.match(State.eval(Cont.eval(evaluator(bool)))(emptyEnv), {
            just: (result) => {
              expect(result).to.eql(true)
              done();
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
      })
      describe("リストを評価する evaluator list expression",() => {
        it("evaluator(Exp.list)", function(done) {
          const list = Exp.list([Exp.num(1), Exp.num(2)]); 
          Maybe.match(State.eval(Cont.eval(evaluator(list)))(emptyEnv), {
            just: (result) => {
              expect(result).to.eql([1,2])
              done();
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
      })
      describe("変数を評価する evaluate variable expression",() => {
        it("evaluator(Exp.variable) で未定義の場合", function(done) {
          const variable = Exp.variable("foo"); 
          Maybe.match(State.eval(Cont.eval(evaluator(variable)))(emptyEnv), {
            just: (result) => {
              expect().to.fail()
              done();
            },
            nothing: (message) => {
              expect(message).to.eql("変数 foo は未定義です")
              done();
            }
          });
        })
        it("evaluator(Exp.variable) で定義済みの場合", function(done) {
          const variable = Exp.variable("bar"); 
          const env = Env.extend("bar", 1)(emptyEnv);
          Maybe.match(State.eval(Cont.eval(evaluator(variable)))(env), {
            just: (result) => {
              expect(result).to.eql(1)
              done();
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
      })
      describe("関数適用を評価する evaluator function application",() => {
        it("(x => (x + 1))(1)",(done) => {
          const x = Exp.variable('x'), one = Exp.num(1);
          const application = Exp.app(
            Exp.lambda(x, Exp.add(x, one)),
            one);

          Maybe.match(State.eval(Cont.eval(evaluator(application)))(emptyEnv),{
            nothing: (_) => {
              expect().fail();
            },
            just: (value) => {
              expect(value).to.eql(2);
              done(); 
            }
          })
        });
        it("app(app(lambda(x, lambda(y, subtract(x,y))), two), one)",(done) => {
          // (({x {y (- x y)}} 2) 1)
          const one = Exp.num(1), two = Exp.num(2);
          const x = Exp.variable('x'), y = Exp.variable('y'),
            application = Exp.app(
              Exp.app(
                Exp.lambda(x, Exp.lambda(y, 
                  Exp.subtract(x, y)))
                , two) , one);
          Maybe.match(State.eval(Cont.eval(evaluator(application)))(emptyEnv),{
            nothing: (_) => {
              expect().fail();
            },
            just: (value) => {
              expect(value).to.eql(1);
              done(); 
            }
          })
        });
        it("app(app(lambda(x, lambda(y, multiply(x,y))), two), three)",(done) => {
          const three = Exp.num(3), two = Exp.num(2);
          const x = Exp.variable('x'), y = Exp.variable('y'),
            application = Exp.app(
              Exp.app(
                Exp.lambda(x, Exp.lambda(y, 
                  Exp.multiply(x, y)))
                , two) , three);
          //  かけ算の評価 
          Semantics.definition.multiply = (expL, expR) => {
            const operator = (operandL, operandR) => {
              return operandL * operandR; 
            };
            return State.state(env => {
              return pair.cons(Semantics.binary(operator)(expL, expR)(env), env);
            });
          },
          Maybe.match(State.eval(Cont.eval(evaluator(application)))(emptyEnv),{
            nothing: (_) => {
              expect().fail();
            },
            just: (value) => {
              expect(value).to.eql(6);
              done(); 
            }
          })
        });
      })
      describe("setを評価する evaluator special function 'set'",() => {
        it("set(x, Exp.num(1)) で値を確認する",(done) => {
          const set = Exp.set(x, one);
          Maybe.match(State.eval(Cont.eval(evaluator(set)))(emptyEnv),{
            nothing: (_) => {
              expect().fail();
            },
            just: (value) => {
              expect(value).to.eql(1);
              done(); 
            }
          })
        });
        it("set(x, Exp.num(1)) で状態を確認する",(done) => {
          const set = Exp.set(x, one);
          const newState = State.run(Cont.eval(evaluator(set)))(emptyEnv),
           newEnv = pair.right(newState); 
          Maybe.match(Env.lookup('x')(emptyEnv),{
            nothing: (_) => {
              expect(true).to.eql(true);
              Maybe.match(Env.lookup('x')(newEnv),{
                nothing: (_) => {
                  expect().fail();
                  done(); 
                },
                just: (value) => {
                  expect(value).to.eql(1);
                  done(); 
                }
              })
            },
            just: (value) => {
              expect().fail();
              done(); 
            }
          })
        });
      })
      describe("ifを評価する evaluator special function 'condition'",() => {
        it("if(true, Exp.num(1), Exp.num(2)) => 2",(done) => {
          const condition = Exp.condition(Exp.bool(true), one, two);
          Maybe.match(State.eval(Cont.eval(evaluator(condition)))(emptyEnv),{
            nothing: (_) => {
              expect().fail();
            },
            just: (value) => {
              expect(value).to.eql(1);
              done(); 
            }
          })
        });
        it("if(false, Exp.num(1), Exp.num(2)) => 2",(done) => {
          const condition = Exp.condition(Exp.bool(false), one, two);
          Maybe.match(State.eval(Cont.eval(evaluator(condition)))(emptyEnv),{
            nothing: (_) => {
              expect().fail();
            },
            just: (value) => {
              expect(value).to.eql(2);
              done(); 
            }
          })
        });

      })
    })
  });
  describe("Lispy.Syntaxをテストする",() => {
    const Syntax = require("../../lib/lispy").Syntax;

    describe("appをテストする",() => {
      describe("単一引数のappの場合",() => {
        it("(succ 1 は parse error", function(done) {
          Maybe.match(Syntax.app()("(succ 1"), {
            just: (result) => {
              console.log(message)
              expect().to.fail()
            },
            nothing: (message) => {
              expect(true).to.eql(true)
              done();
            }
          });
        })
        it("(succ 1) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(succ 1)"), {
            just: (result) => {
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
        it("(succ (succ 1)) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(succ (succ 1))"), {
            just: (result) => {
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
        it("(succ (succ (succ 1))) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(succ (succ (succ 1)))"), {
            just: (result) => {
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
      })
      describe("複数引数のappの場合",() => {
        it("(add 1 2) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(add 1 2)"), {
            just: (result) => {
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
        it("(add 1 (add 2 3)) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(add 1 (add 2 3))"), {
            just: (result) => {
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
        it("(add (add 2 3) 1) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(add (add 2 3) 1)"), {
            just: (result) => {
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
        it("(add (add 1 2) (add 3 4)) はapp式である", function(done) {
          Maybe.match(Syntax.app()("(add (add 1 2) (add 3 4))"), {
            just: (result) => {
              console.log(result)
              Exp.match(result.value, {
                app: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              console.log(message)
              expect().to.fail()
              done();
            }
          });
        })
      });
    });
    describe("setをテストする",() => {
      it("{set x 1}はset式である", function(done) {
        Maybe.match(Syntax.set()("{set x 1}"), {
          just: (result) => {
            Exp.match(result.value, {
              set: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            console.log(message)
            expect().to.fail()
            done();
          }
        });
      })
    });
    describe("lambdaをテストする",() => {
      it("{x x}はlambda式である", function(done) {
        Maybe.match(Syntax.lambda()("{x x}"), {
          just: (result) => {
            Exp.match(result.value, {
              lambda: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            console.log(message)
            expect().to.fail()
            done();
          }
        });
      })
    });
    describe("ifをテストする",() => {
      it("{if #t 1 2}はif式である", function(done) {
        Maybe.match(Syntax.if()("{if #t 1 2}"), {
          just: (result) => {
            Exp.match(result.value, {
              condition: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            console.log(message)
            expect().to.fail()
            done();
          }
        });
      })
    });
    describe("specialをテストする",() => {
      describe("setをテストする",() => {
        it("{set x 1}はset式である", function(done) {
          Maybe.match(Syntax.special()("{set x 1}"), {
            just: (result) => {
              Exp.match(result.value, {
                set: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              console.log(message)
              expect().to.fail()
              done();
            }
          });
        })
      });
      describe("lambdaをテストする",() => {
        it("{x x}はlambda式である", function(done) {
          Maybe.match(Syntax.special()("{x x}"), {
            just: (result) => {
              Exp.match(result.value, {
                lambda: (value) => {
                  expect(true).to.eql(true)
                  done();
                }
              })
            },
            nothing: (message) => {
              expect().to.fail()
              done();
            }
          });
        })
      });
    });
    describe("numberをテストする",() => {
      it("abcはnumberではない", function(done) {
        Maybe.match(Syntax.number()("abc"), {
          just: (result) => {
            expect().to.fail()
            done();
          },
          nothing: (message) => {
            expect(message).to.eql("parse error: bc");
            done();
          }
        });
      })
      it("123はnumberである", function(done) {
        // this.timeout('5s')
        Maybe.match(Syntax.number()("123"), {
          just: (result) => {
            Exp.match(result.value, {
              num: (value) => {
                expect(value).to.eql(123)
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
    })
  });
});

