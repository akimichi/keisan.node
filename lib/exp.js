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

let HyoukaExp = Hyouka.Exp,
  Semantics = Hyouka.Semantics;

const moment = require('moment');

let Exp = {
  /* 式のパターンマッチ関数 */
  match : (data, pattern) => {
    try {
      return data(pattern);
    } catch (err) {
      console.log("exp match error")
      console.log(`pattern: `)
      console.log(util.inspect(pattern, { showHidden: true, depth: null }));
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
  }
  // duration: (number, range) => {
  //   return (pattern) => {
  //     return pattern.duration(number, range);
  //   };
  // }
};

module.exports = Object.assign(Exp, HyoukaExp);

