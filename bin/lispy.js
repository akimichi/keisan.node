'use strict';

/*
 * symple untyped lambda calculus interpreter
 *
 */

const fs = require('fs'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  pair = kansuu.pair,
  array = kansuu.array,
  chars = kansuu.chars;

const Hyouka = require('hyouka.js'),
  Exp =  Hyouka.Exp,
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  State = Monad.State,
  Reader = Monad.Reader,
  Parser = Monad.Parser,
  Cont = Monad.Cont,
  IO = Monad.IO,
  ID = Monad.ID;

const Lispy = require('../lib/lispy'),
  Syntax = Lispy.Syntax;

/*
 * 評価器
 */

const Interpreter = Hyouka.Interpreter;
// const Semantics = Hyouka.Semantics,
//   Interpreter = Hyouka.Interpreter;

//
// repl:: Env -> Cont[IO]
const Repl = (environment) => {
  // const Semantics = require('../lib/semantics.js');
  const Evaluator = Interpreter(Lispy.Syntax.expression, Lispy.Semantics.evaluator);
  const read = (prompt) => {
    const readlineSync = require('readline-sync');
    return IO.unit(readlineSync.question(prompt));
  };


  return Cont.callCC(exit => {
    // loop:: Null -> IO
    const loop = (environment) => {
      return IO.flatMap(read("\nlispy> "))(inputString  => {
        return IO.flatMap(IO.putString(inputString))(_ => {
          if(inputString === 'exit') {
            return exit(IO.done(_));
          } else {
            return Maybe.match(Cont.eval(Evaluator(environment)(inputString)),{
              nothing: (message) => {
                return IO.flatMap(IO.putString(`\nnothing: ${message}`))(_ => {
                  return loop(environment); 
                });
              },
              just: (value) => {
                return IO.flatMap(IO.putString(`\n${value}`))(_ => {
                  return loop(environment); 
                });
              }
            })
          }
        });
      });
    };
    return Cont.unit(loop(environment))
  });
};

/* 
 * 環境 Environment
 */
const environment = Lispy.Env.prelude();

IO.run(Cont.eval(Repl(environment)))

