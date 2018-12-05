"use strict";

const expect = require('expect.js');

const Hyouka = require('hyouka.js'),
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Reader = Monad.Reader,
  Parser = Monad.Parser,
  Cont = Monad.Cont,
  ID = Monad.ID;

const Semantics = require('./semantics.js'),
  Syntax = require('./syntax.js'),
  Exp = require('./exp.js');

const kansuu = require('kansuu.js'),
  pair = kansuu.pair,
  array = kansuu.array;

const Interpreter = {
  // eval:: Env -> String -> Maybe[Value]
  eval: (env) => (line) => {
    // return Maybe.flatMap(Parser.parse(Syntax.expression())(line))(result => {
    return Maybe.flatMap(Parser.parse(Syntax.expr())(line))(result => {
      const exp = result.value;
      return Semantics.evaluate(exp)(env);
    })
  }
};


module.exports = Interpreter;
