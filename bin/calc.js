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

