'use strict';

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
  Interpreter = Hyouka.Interpreter;
const Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Cont = Monad.Cont,
  IO = Monad.IO;

const inputAction = (prompt) => {
  const readlineSync = require('readline-sync');
  return IO.unit(readlineSync.question(prompt));
};


module.exports = (prompt) => (syntax, semantics) => (environment) => {
  const Evaluator = Interpreter(syntax, semantics);

  return Cont.callCC(exit => {
    const loop = () => {
      return IO.flatMap(inputAction(`\n${prompt}> `))(inputString  => {
        switch(inputString) {
          case "exit":
            return exit(IO.done(inputString));
          case "help":
            return IO.flatMap(IO.putString(`\nhelp`))(_ => {
              return loop(env); 
            });
          default:
            return Maybe.match(Cont.eval(Evaluator(environment)(inputString),{ 
              nothing: (message) => {
                return IO.flatMap(IO.putString(`\nError: ${message}`))(_ => {
                  return loop(); 
                });
              },
              just: (value) => {
                return IO.flatMap(IO.putString(`${value}`))(_ => {
                  return loop(env); 
                });
              }
            }));
        }
      });
    };
    return Cont.unit(loop())
  });
};

