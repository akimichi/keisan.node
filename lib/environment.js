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
  }
};


module.exports = Environment;
