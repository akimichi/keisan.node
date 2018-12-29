'use strict';

const  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  Pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
      Monad = Hyouka.Monad,
      Maybe = Monad.Maybe;

const Env = Hyouka.Env,
  Exp = require('../lib/exp.js');

const moment = require('moment');
moment.locale('ja');

const Environment = {
  empty: () => {
    return []; 
  },
  /* 変数名に対応する値を環境から取り出す */
  /* lookup:: 
   * (STRING) -> Map[String, VALUE] => Maybe[VALUE] */
  lookup : (key) =>  (env) => {
    expect(env).to.an('array');
    const answer = array.foldr(env)(undefined)(item => {
      return (accumulator) => {
        return Pair.match(item, {
          cons: (name, _) => {
            if(name === key) {
              return item;
            } else {
              return accumulator;
            };
          }
        })
      };
    });
    if(answer === undefined) {
      return Maybe.nothing(`変数 ${key} は未定義です`);
    } else {
      return Maybe.just(Pair.right(answer));
    }
  },
  /* 環境を拡張する */
  /* extend:: 
   * (STRING, VALUE) => ENV => ENV */
  extend: (key, value) => (env) => { 
    return array.cons(Pair.cons(key, value), env);
  },
  // append:: Array[Pair[String, Exp]] => Env => Env 
  append: (pairs) => (env) => {
    expect(pairs).to.an('array');
    // return array.foldr(pairs)(env)(item => {
    return array.foldl(pairs)(env)(item => {
      return (accumulator) => {
        return Pair.match(item,  {
          cons: (name, exp) => {
            return Env.extend(name, exp)(accumulator)
          }
        })
      };
    });
  },
  pairs: {
    date: [
      Pair.cons('today', ((_) => {
        // return Maybe.just(moment().format('YYYY-MM-DD'));
        // return moment().format('YYYY-MM-DD');
        return moment();
      })()),
      // pair.cons('today', (_)  => {
      //   return Maybe.just(moment());
      // })
      // pair.cons('today', moment()),
      // pair.cons('today', Exp.date(moment())),
      //pair.cons('today', moment().format("YYYY-MM-DD")),
    ],
    calc: [
      // 定数
      Pair.cons('E', Math.E),
      // Math.LN2
      // 2 の自然対数。約 0.693 です。
      Pair.cons('LN2', Math.LN2),
      // Math.LN10
      // 10 の自然対数。約 2.303 です。
      Pair.cons('LN10', Math.LN10),
      // Math.LOG2E
      // 2 を底とした E の対数。約 1.443 です。
      Pair.cons('LOG2E', Math.LOG2E),
      // Math.LOG10E
      // 10 を底とした E の対数。約 0.434 です。
      Pair.cons('LOG10E', Math.LOG10E),
      // Math.SQRT1_2
      // 1/2 の平方根。1 / √2 と等しく、約 0.707 です。
      Pair.cons('SQRT1_2', Math.SQRT1_2),
      // Math.SQRT2
      // 2 の平方根。約 1.414 です。
      Pair.cons('SQRT2', Math.SQRT2),
    ],
  }
};

// module.exports = Object.assign(Env, Environment);
// module.exports = Object.assign(Environment, Env);

module.exports = Environment;
