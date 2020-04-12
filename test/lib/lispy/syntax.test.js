"use strict";

const fs = require('fs'),
  util = require('util'),
  expect = require('expect.js');

const kansuu = require('kansuu.js'),
  array = kansuu.array,
  pair = kansuu.pair;

const Hyouka = require('hyouka.js'),
  Exp = Hyouka.Exp,
  Env = Hyouka.Env,
  Monad = Hyouka.Monad,
  Cont = Monad.Cont,
  State = Monad.State,
  ST = Monad.ST,
  Maybe = Monad.Maybe,
  Parser = Monad.Parser;



// ### Lispy Syntaxのテスト
describe("Lispy.Syntaxをテストする",() => {
  const Syntax = require("../../../lib/lispy").Syntax;

  describe("appをテストする",() => {
    describe("単一引数のappの場合",() => {
      it("(succ 1 は parse error", function(done) {
        Maybe.match(Syntax.app()("(succ 1"), {
          just: (result) => {
            expect().to.fail()
          },
          nothing: (message) => {
            expect(true).to.eql(true)
            done();
          }
        });
      })
      it("(succ 1) はapp式である", function(done) {
        //this.timeout("5s")
        Maybe.match(Syntax.app()("(succ 1)"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (operator, operand) => {
                expect(operator.type).to.eql("variable")
                expect(operand.type).to.eql("num")
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
      it("(succ (succ 1)) はapp式である", function(done) {
        Maybe.match(Syntax.app()("(succ (succ 1))"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (operator, operand) => {
                expect(operator.type).to.eql("variable")
                expect(operand.type).to.eql("app")
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
      it("(succ (succ (succ 1))) はapp式である", function(done) {
        Maybe.match(Syntax.app()("(succ (succ (succ 1)))"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
    })
    describe("複数引数のappの場合",() => {
      it("(add 1 2) はapp式である", function(done) {
        Maybe.match(Syntax.app()("(add 1 2)"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
      it("(add 1 (add 2 3)) はapp式である", function(done) {
        Maybe.match(Syntax.app()("(add 1 (add 2 3))"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
      it("(add (add 2 3) 1) はapp式である", function(done) {
        Maybe.match(Syntax.app()("(add (add 2 3) 1)"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
      it("(add (add 1 2) (add 3 4)) はapp式である", function(done) {
        Maybe.match(Syntax.app()("(add (add 1 2) (add 3 4))"), {
          just: (result) => {
            Exp.match(result.value, {
              app: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            console.log(message)
            expect().to.fail()
            done();
          }
        });
      })
    });
  });
  describe("setをテストする",() => {
    it("{set x 1}はset式である", function(done) {
      Maybe.match(Syntax.set()("{set x 1}"), {
        just: (result) => {
          Exp.match(result.value, {
            set: (value) => {
              expect(true).to.eql(true)
              done();
            }
          })
        },
        nothing: (message) => {
          console.log(message)
          expect().to.fail()
          done();
        }
      });
    })
    it("{set fact {n {if (< n 2) 1 (* n (fact (- n 1)))}}}はset式である", function(done) {
      this.timeout("5s")
      Maybe.match(Syntax.set()("{set fact {n {if (< n 2) 1 (* n (fact (- n 1)))}}}"), {
        just: (result) => {
          expect(result.value.type).to.eql("set")
          console.log(result.value)
          Exp.match(result.value, {
            set: (variable, body) => {
              expect(variable.type).to.eql("variable")
              expect(variable.type.content).to.eql("variable")
              expect(body.type).to.eql("lambda")
              // const condition = body.value.body
              //body.content
              done();
            }
          })
        },
        nothing: (message) => {
          console.log(message)
          expect().to.fail()
          done();
        }
      });
    })
  });
  describe("lambdaをテストする",() => {
    it("{x x}はlambda式である", function(done) {
      Maybe.match(Syntax.lambda()("{x x}"), {
        just: (result) => {
          Exp.match(result.value, {
            lambda: (value) => {
              expect(true).to.eql(true)
              done();
            }
          })
        },
        nothing: (message) => {
          console.log(message)
          expect().to.fail()
          done();
        }
      });
    })
  });
  describe("ifをテストする",() => {
    it("{if #t 1 2}はif式である", function(done) {
      Maybe.match(Syntax.if()("{if #t 1 2}"), {
        just: (result) => {
          Exp.match(result.value, {
            condition: (value) => {
              expect(true).to.eql(true)
              done();
            }
          })
        },
        nothing: (message) => {
          console.log(message)
          expect().to.fail()
          done();
        }
      });
    })
  });
  describe("specialをテストする",() => {
    describe("setをテストする",() => {
      it("{set x 1}はset式である", function(done) {
        Maybe.match(Syntax.special()("{set x 1}"), {
          just: (result) => {
            Exp.match(result.value, {
              set: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            console.log(message)
            expect().to.fail()
            done();
          }
        });
      })
    });
    describe("lambdaをテストする",() => {
      it("{x x}はlambda式である", function(done) {
        Maybe.match(Syntax.special()("{x x}"), {
          just: (result) => {
            Exp.match(result.value, {
              lambda: (value) => {
                expect(true).to.eql(true)
                done();
              }
            })
          },
          nothing: (message) => {
            expect().to.fail()
            done();
          }
        });
      })
    });
  });
  describe("numberをテストする",() => {
    it("abcはnumberではない", function(done) {
      Maybe.match(Syntax.number()("abc"), {
        just: (result) => {
          expect().to.fail()
          done();
        },
        nothing: (message) => {
          expect(message).to.eql("parse error: bc");
          done();
        }
      });
    })
    it("123はnumberである", function(done) {
      // this.timeout('5s')
      Maybe.match(Syntax.number()("123"), {
        just: (result) => {
          Exp.match(result.value, {
            num: (value) => {
              expect(value).to.eql(123)
              done();
            }
          })
        },
        nothing: (message) => {
          expect().to.fail()
          done();
        }
      });
    })
  })
});

