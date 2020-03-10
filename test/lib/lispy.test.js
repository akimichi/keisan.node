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
  State = Monad.State,
  ST = Monad.ST,
  Maybe = Monad.Maybe,
  Parser = Monad.Parser;



// ### Lispyのテスト
describe("Lispyをテストする",() => {
  describe("Lispy.Semanticsをテストする",() => {
    const Semantics = require("../../lib/lispy").Semantics;

    describe("evaluateをテストする",() => {
      it("evaluate(Exp.num)", function(done) {
        const number = Exp.num(2); 
        Maybe.match(State.eval(Semantics.evaluate(number))(Env.empty()), {
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
      describe("真理値を評価する",() => {
        it("evaluate(Exp.bool)", function(done) {
          const bool = Exp.bool(true); 
          Maybe.match(State.eval(Semantics.evaluate(bool))(Env.empty()), {
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
      describe("リストを評価する",() => {
        it("evaluate(Exp.list)", function(done) {
          const list = Exp.list([Exp.num(1), Exp.num(2)]); 
          Maybe.match(State.eval(Semantics.evaluate(list))(Env.empty()), {
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
      describe("変数を評価する",() => {
        it("evaluate(Exp.variable) で未定義の場合", function(done) {
          const variable = Exp.variable("foo"); 
          Maybe.match(State.eval(Semantics.evaluate(variable))(Env.empty()), {
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
        it("evaluate(Exp.variable) で定義済みの場合", function(done) {
          const variable = Exp.variable("bar"); 
          const env = Env.extend("bar", 1)(Env.empty());
          Maybe.match(State.eval(Semantics.evaluate(variable))(env), {
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

