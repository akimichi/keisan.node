'use strict';

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js');
const Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Cont = Monad.Cont,
  IO = Monad.IO;

const Exp = require('../lib/exp.js'),
  Interpreter = require('../lib/interpreter.js');

const Repl = {
  run: (prompt) => (environment) => {
    const inputAction = (prompt) => {
      const readlineSync = require('readline-sync');
      return IO.unit(readlineSync.question(prompt));
    };

    return Cont.callCC(exit => {

      const loop = (env) => {
        return IO.flatMap(inputAction(`\n${prompt}> `))(inputString  => {
          switch(inputString) {
            case "exit":
              return exit(IO.done(inputString));
            case "help":
              return IO.flatMap(IO.putString(`\nhelp`))(_ => {
                return loop(env); 
              });
            default:
              return Maybe.match(Interpreter.eval(env)(inputString),{ 
                nothing: (message) => {
                  return IO.flatMap(IO.putString(`\nnothing: ${message}`))(_ => {
                    return loop(env); 
                  });
                },
                just: (value) => {
                  return IO.flatMap(IO.putString(`${value}`))(_ => {
                    return loop(env); 
                  });
                }
              })
          }
        });
      };

      return Cont.unit(loop(environment))
    });
  }
};

module.exports = Repl;
