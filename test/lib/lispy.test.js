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

    describe("evaluatorをテストする",() => {
      const evaluator = Semantics.evaluate(Semantics.definition);
      it("evaluator(Exp.num)", function(done) {
        const number = Exp.num(2); 
        Maybe.match(State.eval(Cont.eval(evaluator(number)))(Env.empty()), {
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
      describe("真理値を評価する evaluate bool expression",() => {
        it("evaluator(Exp.bool)", function(done) {
          const bool = Exp.bool(true); 
          Maybe.match(State.eval(Cont.eval(evaluator(bool)))(Env.empty()), {
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
          Maybe.match(State.eval(Cont.eval(evaluator(list)))(Env.empty()), {
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
          Maybe.match(State.eval(Cont.eval(evaluator(variable)))(Env.empty()), {
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
          const env = Env.extend("bar", 1)(Env.empty());
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

          Maybe.match(State.eval(Cont.eval(evaluator(application)))(Env.empty()),{
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
          const one = Exp.num(1), two = Exp.num(2);
          const x = Exp.variable('x'), y = Exp.variable('y'),
            application = Exp.app(
              Exp.app(
                Exp.lambda(x, Exp.lambda(y, 
                  Exp.subtract(x, y)))
                , two) , one);
          Maybe.match(State.eval(Cont.eval(evaluator(application)))(Env.empty()),{
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
          Maybe.match(State.eval(Cont.eval(evaluator(application)))(Env.empty()),{
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
          const one = Exp.num(1), x = Exp.variable('x'),
            set = Exp.set(x, one);
          Maybe.match(State.eval(Cont.eval(evaluator(set)))(Env.empty()),{
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
          const one = Exp.num(1), x = Exp.variable('x'),
            set = Exp.set(x, one),
            initEnv = Env.empty();
          const newState = State.run(Cont.eval(evaluator(set)))(initEnv),
           newEnv = pair.right(newState); 
          Maybe.match(Env.lookup('x')(initEnv),{
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
    });
  });
  describe("Lispy.Syntaxをテストする",() => {
    const Syntax = require("../../lib/lispy").Syntax;

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

