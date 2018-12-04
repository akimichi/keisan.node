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
    return Maybe.flatMap(Semantics.evaluate(expL)(env))(valueL => {
      return Maybe.flatMap(Semantics.evaluate(expR)(env))(valueR => {
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
      /* 関数定義（λ式）の評価  */
      // lambda:: (Var, Exp) -> Reader[Maybe[FUN[VALUE -> Reader[Maybe[VALUE]]]]]
      lambda: (identifier, body) => {
        return Exp.match(identifier,{
          variable: (name) => {
            const closure = (actualArg => {
              const localEnv = Env.extend(name, actualArg)(env);
              return Semantics.evaluate(body)(localEnv);
            });
            return Maybe.just(closure); 
          }
        });
      },
      /* 関数適用の評価 */
      // app: (Exp, Exp) -> Reader[Maybe[Value]]
      app: (operator, operand) => {
        return Maybe.flatMap(Semantics.evaluate(operator)(env))(closure => {
          return Maybe.flatMap(Semantics.evaluate(operand)(env))(actualArg => {
            // return Maybe.just(closure(actualArg));
            return closure(actualArg);
          });
        });
      },
      // 日付の評価
      date: (value) => { return Maybe.just(value); },
      // 期間の評価
      duration: (value) => { return Maybe.just(value); },
      //  足し算の評価 
      add: (expL, expR) => {
        //  足し算の評価 
        return Maybe.flatMap(Semantics.evaluate(expL)(env))(valueL => {
          return Maybe.flatMap(Semantics.evaluate(expR)(env))(valueR => {
            if(moment.isMoment(valueL) === true) {
              if(moment.isDuration(valueR) === true) {
                return Maybe.just(valueL.add(valueR));
              }
            } else if(moment.isDuration(valueL) === true) {
              if(moment.isDuration(valueR) === true) {
                return Maybe.just(valueL.add(valueR));
              }
            }
          });
        });
      },
      // 引き算の評価 
      subtract: (expL, expR) => {
        return Maybe.flatMap(Semantics.evaluate(expL)(env))(valueL => {
          return Maybe.flatMap(Semantics.evaluate(expR)(env))(valueR => {
            if(moment.isMoment(valueL) === true) {
              if(moment.isMoment(valueR) === true) {
                const difference = Math.abs(valueL.diff(valueR,'days')) + 1;
                return Maybe.just(difference);
              }else if(moment.isDuration(valueL) === true) {
                return Maybe.just(valueL.subtract(valueR));
              }
            } else if(moment.isDuration(valueL) === true) {
              if(moment.isDuration(valueR) === true) {
                return Maybe.just(valueL.add(valueR));
              }
            }
          });
        });
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
