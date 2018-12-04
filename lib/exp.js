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
  Reader = Monad.Reader,
  Parser = Monad.Parser,
  ID = Monad.ID;

const HyoukaExp = Hyouka.Exp,
  Semantics = Hyouka.Semantics;

const moment = require('moment');

const Exp = {
  /* 式のパターンマッチ関数 */
  match : (data, pattern) => {
    try {
      return data(pattern);
    } catch (err) {
      console.log("exp match error")
      console.log(`pattern: `)
      console.log(util.inspect(pattern, { showHidden: true, depth: null }));
      return err;
    }

  },
  /* 日付の式 
   *  momementインスタンスで保持する
   */
  date: (value) => {
    // expect(value).to.be.a('number')
    return (pattern) => {
      return pattern.date(value);
    };
  },
  duration: (value) => {
    return (pattern) => {
      return pattern.duration(value);
    };
  },
  add: (date, duration) => {
    return (pattern) => {
      return pattern.add(date, duration);
    };
  },
  subtract: (date, duration) => {
    return (pattern) => {
      return pattern.subtract(date, duration);
    };
  },
  /* 変数の式 */
  variable : (name) => {
    expect(name).to.be.a('string')
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  /* 関数定義の式(λ式) */
  lambda: (variable, body) => {
    expect(variable).to.be.a('function')
    return (pattern) => {
      return pattern.lambda(variable, body);
    };
  },
  /* 関数適用の式 */
  app: (operator, operand) => {
    // expect(closure).to.be.a('function')
    return (pattern) => {
      return pattern.app(operator, operand);
    };
  },
};

// module.exports = Object.assign(HyoukaExp, Exp);
// module.exports = Object.assign(Exp, HyoukaExp);
module.exports = Exp;

