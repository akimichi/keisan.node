#!/usr/bin/env node
'use strict';

const Hyouka = require('hyouka.js');
 
const Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Cont = Monad.Cont,
  IO = Monad.IO;
 
const Env = Hyouka.Env,
  Exp = Hyouka.Exp,
  Semantics = Hyouka.Semantics,
  Interpreter = Hyouka.Interpreter;
 
 
const repl = (environment) => {
  const inputAction = (prompt) => {
    const readlineSync = require('readline-sync');
    return IO.unit(readlineSync.question(prompt));
  };
 
  return Cont.callCC(exit => {
    const loop = () => {
      return IO.flatMap(inputAction("\ncalc> "))(inputString  => {
        return IO.flatMap(IO.putString(inputString))(_ => {
          if(inputString === 'exit') {
            return exit(IO.done(_));
          } else {
            return Maybe.match(Cont.eval(Interpreter.eval(inputString)(environment)),{
              nothing: (message) => {
                return IO.flatMap(IO.putString(`\nnothing: ${message}`))(_ => {
                  return loop(); 
                });
              },
              just: (value) => {
                return IO.flatMap(IO.putString(`\n${value}`))(_ => {
                  return loop(); 
                });
              }
            })
          }
        });
      });
    };
    return Cont.unit(loop())
  });
};
 
IO.run(Cont.eval(repl(Env.prelude())))
