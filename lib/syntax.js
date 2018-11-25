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
  Date: {
    variable: (_) => {
      return Parser.token(Parser.flatMap(Parser.identifier(["^"]))(name => {
        return Parser.unit(Exp.variable(name));
      }))
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
  },
  Lisp: {
  },
  Pollish: {
  }
}


module.exports = Syntax;
