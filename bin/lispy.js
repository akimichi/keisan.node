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


//
const read = (prompt) => {
  const readlineSync = require('readline-sync');
  return IO.unit(readlineSync.question(prompt));
};

/* 評価器 */
const Lispy = require("../lib/lispy"),
  Interpreter = Lispy.Interpreter,
  Semantics = Lispy.Semantics,
  Syntax = Lispy.Syntax;

// LispyInterpreter:: String -> Cont[State[Maybe[VALUE]]]
const LispyInterpreter = Interpreter(Syntax.expression)(Semantics.definition);
//const LispyInterpreter = Interpreter(Syntax.expression)(Semantics.definition);

// Interpreter:: Syntax => Definition => String => Cont[State[Maybe[VALUE]]]
// const Interpreter = (syntax) => (definition) => (line) => {
//   return Maybe.flatMap(Parser.parse(syntax())(line))(result =>  {
//     const exp = result.value;
//     return Semantics.evaluate(definition)(exp) // => Cont[State[Maybe[VALUE]]]
//   });
// };


// Repl:: () => State[Cont[IO]]
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
              const newState = State.run(Cont.eval(LispyInterpreter(inputString)))(environment),
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

