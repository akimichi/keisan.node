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

// const Lispy = require('../lib/lispy'),
//   Syntax = Lispy.Syntax;

/*
 * 評価器
 */

// const Interpreter = Hyouka.Interpreter,
//   Semantics = Hyouka.Semantics;

// const Evaluator = (syntax, evaluator) => {
//   return (env) => (line) => { // Cont[Maybe[Value]]
//     return Maybe.flatMap(Parser.parse(syntax())(line))(result =>  {
//       const exp = result.value;
//       return evaluator(exp)(env); // Cont[Maybe[Value]]
//     })
//   }
// };

//
const read = (prompt) => {
  const readlineSync = require('readline-sync');
  return IO.unit(readlineSync.question(prompt));
};
//
// const Evaluator = Interpreter(Lispy.Syntax.expression, Semantics.evaluator);
const Lispy = require("../lib/lispy"),
  Semantics = Lispy.Semantics,
  Syntax = Lispy.Syntax;

// Evaluator:: (Syntax, Definition) => String => Cont[State[Maybe[VALUE]]]
const Evaluator = (syntax, definition) => (line) => {
  return Maybe.flatMap(Parser.parse(syntax())(line))(result =>  {
    const exp = result.value;
    return Semantics.evaluate(definition)(exp) // => Cont[State[Maybe[VALUE]]]
  });
};
// evaluate:: String -> Cont[State[Maybe[VALUE]]]
const evaluator = Evaluator(Syntax.expression, Semantics.definition);

// repl:: () => State[Cont[IO]]
const Repl = () => {
  return State.state(env => {
    return Cont.callCC(exit => {

      // loop:: (Env) -> IO
      const loop = (environment) => {
        return IO.flatMap(read("\nlispy> "))(inputString  => {
          return IO.flatMap(IO.putString(inputString))(_ => {
            if(inputString === 'exit') {
              return exit(IO.done());
            } else {
              const newState = State.run(Cont.eval(evaluator(inputString)))(environment),
                maybeValue = pair.left(newState),
                newEnv = pair.right(newState);

              return Maybe.match(maybeValue,{
                nothing: (message) => {
                  return IO.flatMap(IO.putString(`\nnothing: ${message}`))(_ => {
                    return loop(environment); 
                  });
                },
                just: (value) => {
                  return IO.flatMap(IO.putString(`\n${value}`))(_ => {
                    return loop(newEnv); 
                  });
                }
              })
            }
          });
        });
      };// end of loop
      return loop(env)
    });  // end of Cont.callCC
  });  // end of State.state
};

/* 環境 Environment */
const environment = Lispy.Env.prelude();

IO.run(Cont.eval(State.run(Repl())(environment)));
// IO.run(Cont.eval(Repl().run(environment)));

