#!/usr/bin/env node
'use strict';

const Hyouka = require('hyouka.js');
  
const Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Cont = Monad.Cont,
  IO = Monad.IO;
 
const Env = Hyouka.Env,
  Interpreter = Hyouka.Interpreter;

const Environment = require('../lib/environment.js'),
  Syntax = require('../lib/syntax.js'),
  Semantics = require('../lib/semantics.js'),
  prelude = Environment.prelude(Environment.pairs.date)(Env.prelude()),
  Repl = require('../lib/repl.js');

const Exp = require('../lib/exp.js');

IO.run(Cont.eval(Repl.run('date')(prelude)))


