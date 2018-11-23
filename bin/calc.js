#!/usr/bin/env node
'use strict';

const Hyouka = require('hyouka.js');
  
const Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Cont = Monad.Cont,
  IO = Monad.IO;
 
const Env = Hyouka.Env,
  Exp = Hyouka.Exp,
  Syntax = Hyouka.Syntax,
  Semantics = Hyouka.Semantics,
  Interpreter = Hyouka.Interpreter;

const Environment = require('../lib/environment.js'),
  prelude = Environment.prelude(Environment.pairs.calc)(Env.prelude()),
  Repl = require('../lib/repl.js');

const language = Interpreter.mkInterpreter(Syntax.expression)(Semantics.evaluate);
IO.run(Cont.eval(Repl.run('calc')(language)(prelude)))

// const repl = (environment) => {
//   const inputAction = (prompt) => {
//     const readlineSync = require('readline-sync');
//     return IO.unit(readlineSync.question(prompt));
//   };
 
//   return Cont.callCC(exit => {

//     const loop = (env) => {
//       return IO.flatMap(inputAction("\ncalc> "))(inputString  => {
//         return IO.flatMap(IO.putString(inputString))(_ => {
//           if(inputString === 'exit') {
//             return exit(IO.done(_));
//           } else {
//             return Maybe.match(Cont.eval(Interpreter.eval(env)(inputString)),{
//               nothing: (message) => {
//                 return IO.flatMap(IO.putString(`\nnothing: ${message}`))(_ => {
//                   return loop(env); 
//                 });
//               },
//               just: (value) => {
//                 return IO.flatMap(IO.putString(`\n${value}`))(_ => {
//                   return loop(env); 
//                 });
//               }
//             })
//           }
//         });
//       });
//     };

//     return Cont.unit(loop(environment))
//   });
// };
 
// IO.run(Cont.eval(repl(prelude)))
