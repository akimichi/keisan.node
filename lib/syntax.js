'use strict';

const expect = require('expect.js'),
  util = require('util');

const kansuu = require('kansuu.js'),
  pair = kansuu.pair,
  array = kansuu.array,
  string = kansuu.string;

const Hyouka = require('hyouka.js'),
  Monad = Hyouka.Monad,
  Maybe = Monad.Maybe,
  Parser = Monad.Parser;

const Exp = require('../lib/exp.js');

const moment = require('moment');

const Syntax = {
  expression: (_) => {
    return Parser.alt(Syntax.Date.date(), Syntax.Date.variable());
  },
  expr: () => {
    return Parser.chainl1(Syntax.term, Syntax.Date.addOp);
  },
  term: () => {
    return Parser.chainr1(Syntax.factor, Syntax.Date.multiplyOp);
  },
  factor: () => {
    const open = Parser.char("("), close = Parser.char(")");
    return Parser.alt(
      Parser.alt(Syntax.Date.date(), 
        Parser.alt(Syntax.Date.duration(),
          Parser.alt(Syntax.variable(),
            Parser.bracket(open, Syntax.expr, close)))));

    // return Parser.alt(
    //   Parser.alt(Syntax.Date.date(), 
    //     Parser.alt(Syntax.Date.duration(),
    //       Parser.alt(Syntax.Date.variable(),
    //         Parser.bracket(open, Syntax.expr, close))
    //     )));
  },
  variable: (_) => {
    return Parser.token(Parser.flatMap(Parser.identifier(["^"]))(name => {
      return Parser.unit(Exp.variable(name));
    }))
  },
  Date: {
    addOp: () => {
      const plus = Parser.token(Parser.char("+")),
        minus = Parser.token(Parser.char("-"));
      return Parser.flatMap(Parser.alt(plus, minus))(symbol => {
        console.log(`symbol: ${symbol}`)
        switch(symbol) {
          case "+":
            const add = (expL) => (expR) => {
              const l = Exp.variable('l'), r = Exp.variable('r');
              return Exp.app(
                  Exp.app(
                    Exp.lambda(r, 
                      Exp.lambda(l, 
                        Exp.add(l, r)))
                    , expR), 
                  expL);
            };
            return Parser.unit(add);
          case "-":
            const subtract = (expL) => (expR) => {
              const x = Exp.variable('x'), 
                y = Exp.variable('y'),
                application = Exp.app(
                  Exp.app(
                    Exp.lambda(x, Exp.lambda(y, 
                      Exp.subtract(x, y)))
                    , expR) , expL);
              return application;
            };
            return Parser.unit(subtract);
          default: 
            return Parser.zero;
        }
      });
    },
    multiplyOp: () => {
      const multiply = Parser.token(Parser.char("*")),
        divide = Parser.token(Parser.char("/"));
      const x = Exp.variable('x'), 
        y = Exp.variable('y');
      return Parser.flatMap(Parser.alt(multiply, divide))(symbol => {
        switch(symbol) {
          case "*":
            const multiply = (expL) => (expR) => {
              return Exp.app(
                Exp.app(
                  Exp.lambda(x, Exp.lambda(y, 
                    Exp.multiply(x, y)))
                  , expR) , expL);
            };
            return Parser.unit(multiply);
          case "/":
            const divide = (expL) => (expR) => {
              return Exp.app(
                Exp.app(
                  Exp.lambda(x, Exp.lambda(y, 
                    Exp.divide(x, y)))
                  , expR) , expL);
            };
            return Parser.unit(divide);
          default: 
            return Parser.zero;
        }
      });
    },
    /*
     * date式
     *   @YYYY-MM-DD
     *
     */
    date: (_) => {
      const at = Parser.char("@"),
        dash = Parser.char("-");
      return Parser.flatMap(at)(_ => {
        return Parser.flatMap(Parser.numeric())(year => {
          return Parser.flatMap(dash)(_ => {
            return Parser.flatMap(Parser.numeric())(month => {
              return Parser.flatMap(dash)(_ => {
                return Parser.flatMap(Parser.numeric())(day => {
                  const date = moment(`${year}-${month}-${day}`);
                  return Parser.unit(Exp.date(date));
                });
              });
            });
          });
        });
      });
    },
    /* duration式
     *
     *  number days
     *  number weeks
     *  number months
     *
     */
    duration: (_) => {
      const day = (_) => {
        return Parser.flatMap(Parser.numeric())(number => {
          return Parser.flatMap(Parser.regex(/^days?/))(_ => {
            const duration = moment.duration(number, 'days')
            return Parser.unit(Exp.duration(duration));
            // return Parser.unit(Exp.duration(number, 'day'));
          });
        });
      };
      const week = (_) => {
        return Parser.flatMap(Parser.numeric())(number => {
          return Parser.flatMap(Parser.regex(/^weeks?/))(_ => {
            const duration = moment.duration(number, 'weeks')
            return Parser.unit(Exp.duration(duration));
            // return Parser.unit(Exp.duration(number, 'week'));
          });
        });
      };
      const month = (_) => {
        return Parser.flatMap(Parser.numeric())(number => {
          return Parser.flatMap(Parser.regex(/^months?/))(_ => {
            const duration = moment.duration(number, 'months')
            return Parser.unit(Exp.duration(duration));
            // return Parser.unit(Exp.duration(number, 'month'));
          });
        });
      };
      return Parser.alt(day(), Parser.alt(week(),month()));
    }
  }
}


module.exports = Syntax;
