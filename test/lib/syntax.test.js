"use strict";

const fs = require('fs'),
  util = require('util'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Parser = Monad.Parser;

const Syntax = require("../../lib/syntax.js"),
  Exp = require("../../lib/exp.js");

// ### Syntaxのテスト
describe("Syntaxをテストする",() => {

  describe("expr", () => {
    it("dateをテストする", function(done) {
      Maybe.match(Syntax.expr()("@2018-11-23"), {
        just: (result) => {
          Exp.match(result.value, {
            date: (value) => {
              expect(value.isSame("2018-11-23")).to.eql(true);
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
  describe("date", () => {
    it("dateをテストする", function(done) {
      Maybe.match(Syntax.Date.date()("@2018-11-23"), {
        just: (result) => {
          Exp.match(result.value, {
            date: (value) => {
              expect(value.isSame("2018-11-23")).to.eql(true);
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
  describe("duration", () => {
    it("durationでdayをテストする", function(done) {
      // this.timeout('5s')
      Maybe.match(Syntax.Date.duration()("14 days"), {
        just: (result) => {
          Exp.match(result.value, {
            duration: (instance) => {
              expect(instance.as('days')).to.eql(14);
              // expect(instance.humanize()).to.eql("14 days");
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
    // it("durationでweekをテストする",(done) => {
    //   Maybe.match(Syntax.Date.duration()("2 week"), {
    //     just: (result) => {
    //       Exp.match(result.value, {
    //         duration: (number, range) => {
    //           expect(number).to.eql(2);
    //           done();
    //         }
    //       })
    //     },
    //     nothing: (message) => {
    //       expect().to.fail()
    //       done();
    //     }
    //   });
    // })
  });
});
