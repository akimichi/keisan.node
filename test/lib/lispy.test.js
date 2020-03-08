"use strict";

const fs = require('fs'),
  util = require('util'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
  Exp = Hyouka.Exp,
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Parser = Monad.Parser;



// ### Lispyのテスト
describe("Lispyをテストする",() => {
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

