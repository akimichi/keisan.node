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

