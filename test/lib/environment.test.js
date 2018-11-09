"use strict";

const fs = require('fs'),
  util = require('util'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;


// ### Environmentのテスト
describe("Environmentをテストする",() => {
  const Environment = require("../../lib/environment.js");

  const Hyouka = require('hyouka.js');
  const Monad = Hyouka.Monad,
    Maybe = Monad.Maybe,
    Cont = Monad.Cont,
    IO = Monad.IO;

  const Env = Hyouka.Env,
    Exp = Hyouka.Exp;

  describe("Environment.preludeをテストする",() => {
    it("定数をテストする",(done) => {
      const pairs = [
        pair.cons('E', Math.E)
      ];
      const prelude = Environment.prelude(pairs)(Env.empty());
      Maybe.match(Env.lookup('E')(prelude),{
        nothing: (_) => {
          expect().fail();
          done();
        },
        just: (value) => {
          expect(value).to.eql(Math.E);
          done(); 
        }
      })
    });
  });

});

