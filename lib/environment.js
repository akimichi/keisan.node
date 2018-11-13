'use strict';

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js');

const Env = Hyouka.Env,
  Exp = Hyouka.Exp;

const Environment = {
  // prelude:: Array[Pair[String, value]] => Env => Env 
  prelude: (pairs) => (env) => {
    // const pairs = [
    //   // 定数
    //   pair.cons('PI', Math.PI),
    //   pair.cons('E', Math.E),
    //   // 関数
    //   pair.cons('succ', (n => { 
    //     return Maybe.just(n + 1); 
    //   })),
    //   pair.cons('pow', (n) => { 
    //     return Maybe.just(m => {
    //       return Maybe.just(Math.pow(m, n)); 
    //     });
    //   })
    // ];
    return array.foldr(pairs)(env)(item => {
      return (accumulator) => {
        return pair.match(item,  {
          cons: (key, value) => {
            return Env.extend(key, value)(accumulator)
          }
        })
      };
    });
  },
  pairs: {
    calc: [
      // 定数
      pair.cons('E', Math.E),
      // Math.LN2
      // 2 の自然対数。約 0.693 です。
      pair.cons('LN2', Math.LN2),
      // Math.LN10
      // 10 の自然対数。約 2.303 です。
      pair.cons('LN10', Math.LN10),
      // Math.LOG2E
      // 2 を底とした E の対数。約 1.443 です。
      pair.cons('LOG2E', Math.LOG2E),
      // Math.LOG10E
      // 10 を底とした E の対数。約 0.434 です。
      pair.cons('LOG10E', Math.LOG10E),
      // Math.SQRT1_2
      // 1/2 の平方根。1 / √2 と等しく、約 0.707 です。
      pair.cons('SQRT1_2', Math.SQRT1_2),
      // Math.SQRT2
      // 2 の平方根。約 1.414 です。
      pair.cons('SQRT2', Math.SQRT2),
    ],
  }
};


module.exports = Environment;
