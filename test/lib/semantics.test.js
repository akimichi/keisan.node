"use strict";

const fs = require('fs'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  ST = Monad.ST,
  Cont = Monad.Cont;

const moment = require('moment');

// ### Semanticsのテスト
describe("Semanticsをテストする",() => {
  const Env = require("../../lib/environment.js"),
    Exp = require("../../lib/exp.js"),
    Syntax = require("../../lib/syntax.js"),
    Semantics = require("../../lib/semantics.js");

  describe("値を評価する",() => {
    describe("dateを評価する",() => {
      it("evaluate(date)は、Maybe.just(文字列)を返す",(done) => {
        const t = Exp.date(moment("2018-12-01"));
        Maybe.match(Semantics.evaluate(t)(Env.empty()),{
          nothing: (_) => {
            expect().fail();
          },
          just: (value) => {
            expect(value).to.eql(moment("2018-12-01"));
            done(); 
          }
        })
      });
    });
  });
  describe("演算子を評価する",() => {
    it("add(date,duration)は、Maybe.just(date)を返す",(done) => {
      const date = Exp.date(moment("2018-12-01")),
        duration = Exp.duration(moment.duration(7, 'days'));

      Maybe.match(Semantics.evaluate(Exp.add(date, duration))(Env.empty()),{
        just: (value) => {
          expect(value.isSame(moment('2018-12-08'))).to.eql(true);
          done(); 
        },
        nothing: (_) => {
          expect().fail();
        }
      })
    });
    // it("subtract(2,1)は、Maybe.just(1)を返す",(done) => {
    //   const one = Exp.num(1),
    //     two = Exp.num(2);
    //   const initialEnv = Env.empty()

    //   Maybe.match(Cont.eval(Semantics.evaluate(Exp.subtract(two, one))(initialEnv)),{
    //     nothing: (_) => {
    //       expect().fail();
    //     },
    //     just: (value) => {
    //       expect(value).to.eql(1);
    //       done(); 
    //     }
    //   })
    // });
  });
  // describe("Exp.appを評価する",() => {
  //   it("(x => succ(x))(1)",(done) => {
  //     const x = Exp.variable('x'),
  //       one = Exp.num(1);
  //     // (^x { succ(x) })(1)
  //     const application = Exp.app(
  //       Exp.lambda( x, Exp.succ(x)) 
  //       ,one
  //     );

  //     Maybe.match(Cont.eval(Semantics.evaluate(application)(Env.empty())),{
  //       nothing: (_) => {
  //         expect().fail();
  //       },
  //       just: (value) => {
  //         expect(value).to.eql(2);
  //         done(); 
  //       }
  //     })
  //   });
  //   it("(x => (x + 1))(1)",(done) => {
  //     const x = Exp.variable('x'),
  //       one = Exp.num(1);
  //     const application = Exp.app(
  //       Exp.lambda(x, Exp.add(x, one)),
  //       one);

  //     Maybe.match(Cont.eval(Semantics.evaluate(application)(Env.empty())),{
  //       nothing: (_) => {
  //         expect().fail();
  //       },
  //       just: (value) => {
  //         expect(value).to.eql(2);
  //         done(); 
  //       }
  //     })
  //   });
  // });
  // describe("変数を評価する",() => {
  //   it("evaluate(a)でMaybe.justを返す",(done) => {
  //     const variable = Exp.variable('a');
  //     const initialEnv = Env.extend('a', 1)(Env.empty())

  //     Maybe.match(Cont.eval(Semantics.evaluate(variable)(initialEnv)),{
  //       nothing: (_) => {
  //         expect().fail();
  //       },
  //       just: (value) => {
  //         expect(value).to.eql(1);
  //         done(); 
  //       }
  //     })
  //   });
  // });
});


