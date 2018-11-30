'use strict';

const expect = require('expect.js'),
  util = require('util');

const kansuu = require('kansuu.js'),
  pair = kansuu.pair,
  array = kansuu.array,
  string = kansuu.string;

const Hyouka = require('hyouka.js'),
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Cont = Monad.Cont,
  Parser = Monad.Parser;

const Exp = require('../lib/exp.js'),
  Env = Hyouka.Env;

const moment = require('moment');

const Semantics = {
  // 2項演算の評価 
  binary: (operator) => (expL, expR) => (env) => {
    return Maybe.flatMap(Cont.eval(Semantics.evaluate(expL)(env)))(valueL => {
      return Maybe.flatMap(Cont.eval(Semantics.evaluate(expR)(env)))(valueR => {
        return Maybe.just(operator(valueL,valueR)); 
      });
    });
  },
  // NOTE:: 返値をValueではなく、Expとした
  // evaluate:: Exp -> Env -> Maybe[Value]
  evaluate: (anExp) => (env) => {
    return Exp.match(anExp,{
      // 変数の評価
      variable: (name) => {
        return Env.lookup(name)(env);
      },
      // 日付の評価
      date: (value) => { return Maybe.just(value); },
      // date: (value) => { return Maybe.just(value.format()); },
      // 期間の評価
      duration: (value) => { return Maybe.just(value); },
      //  足し算の評価 
      add: (expL, expR) => {
        Exp.match(expL, {
          date: (date) => {
            Exp.match(expR, {
              duration: (duration) => {
                return Maybe.just(Exp.date(date.add(duration)));
              },
              date: (date) => {
                expect().to.fail()
              }
            });
          },
          duration: (duration) => {
            expect().to.fail()
          }
        });
      },
      // 引き算の評価 
      subtract: (expL, expR) => {
        const operator = (operandL, operandR) => {
          return operandL - operandR; 
        };
        return Semantics.binary(operator)(expL, expR)(env);
      },
      // かけ算の評価 
      multiply: (expL, expR) => {
        const operator = (operandR, operandL) => {
          return operandR * operandL; 
        };
        return Semantics.binary(operator)(expL, expR)(env);
      },
      // 割り算の評価 
      divide: (expL, expR) => {
        const operator = (operandR, operandL) => {
          return operandR / operandL; 
        };
        return Semantics.binary(operator)(expL, expR)(env);
      },
      // moduleの評価 
      modulo: (expL, expR) => {
        const operator = (operandL, operandR) => {
          return operandL % operandR; 
        };
        return Semantics.binary(operator)(expR, expL)(env);
      },
      // exponentialの評価 
      exponential: (expL, expR) => {
        const operator = (operandR, operandL) => {
          return Math.pow(operandR, operandL); 
        };
        return Semantics.binary(operator)(expL, expR)(env);
      },
    });
  }
};

module.exports = Semantics;
