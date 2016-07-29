//remove:
var Dodgy = require('../build/dodgy.node.js');
//:remove

wru.test([
  {
    name: 'main',
    test: function () {
      wru.assert(typeof Dodgy == "function");
    }
  },{
    name: 'works as promise',
    test: function () {
      var p = new Dodgy(function (res, rej) {
        setTimeout(function () {
          res('OK');
        }, 100);
      });
      wru.assert('p has no abortability', !p.abort);
      p.then(wru.async(function (allGood) {
        wru.assert(allGood);
      }));
    }
  },{
    name: 'abort as expected',
    test: function () {
      var p = new Dodgy(function (res, rej, onAbort) {
        var t = setTimeout(function () {
          res('OK');
        }, 100);
        onAbort(function () {
          clearTimeout(t);
          return 'FAIL';
        });
      });
      wru.assert('p can be aborted', p.abort);
      p.then(Object, wru.async(function (err) {
        wru.assert(err === 'FAIL');
      }));
      setTimeout(p.abort, 10);
    }
  },{
    name: 'chainable and resolvable',
    test: function () {
      var chain = new Dodgy(function (res, rej, onAbort) {
        var t = setTimeout(
          function () {
            res('OK');
          }, 100);
          onAbort(Object);
        },
        true
      );
      wru.assert('resolvable', chain.resolve);
      wru.assert('rejectable', chain.reject);
      chain = chain.then(Object, Object).then(Object, Object).then(Object, Object);
      wru.assert('still resolvable', chain.resolve);
      wru.assert('still rejectable', chain.reject);
      wru.assert('still abortable', chain.abort);
      chain.then(wru.async(function (msg) {
        wru.assert('message received', msg == 'EVEN BETTER');
      }));
      setTimeout(function () {
        chain.resolve('EVEN BETTER');
      }, 10);
    }
  },{
    name: 'chainable and rejectable',
    test: function () {
      function reThrow(err) {
        throw err;
      }
      var chain = new Dodgy(
        function (res, rej, onAbort) {
          var t = setTimeout(res, 100, 'OK');
          onAbort(Object);
        },
        true
      );
      wru.assert('resolvable', chain.resolve);
      wru.assert('rejectable', chain.reject);
      chain = chain.then(Object, reThrow)['catch'](reThrow).then(Object, reThrow)['catch'](reThrow);
      wru.assert('still resolvable', chain.resolve);
      wru.assert('still rejectable', chain.reject);
      wru.assert('still abortable', chain.abort);

      chain.then(Object, wru.async(function (msg) {
        wru.assert('message received', msg == 'EPIC FAIL');
      }));

      setTimeout(function () {
        chain.reject('EPIC FAIL');
      }, 10);
    }
  },{
    name: 'multiple abort not invoked',
    test: function () {
      var i = 0,  chain = new Dodgy(
        function (res, rej, onAbort) {
          onAbort(function () {
            ++i;
          });
        }
      );
      chain.abort();
      chain.abort();
      wru.log(i);
      wru.assert('called only once', i === 1);
    }
  },{
    name: 'Dodgy.race with no winner',
    test: function () {
      var
        counter = 0,
        firstDog = function () { if (++counter > 1) ok(); },
        secondDog = function () { if (++counter > 1) ok(); },
        ok = (function () {
          wru.assert('everything was canceled', counter === 2);
        })
      ;
      Dodgy.race([
        new Dodgy(function (res, rej, onAbort) {
          onAbort(firstDog);
        }),
        new Dodgy(function (res, rej, onAbort) {
          onAbort(secondDog);
        })
      ]).abort();
    }
  } ,{
    name: 'Dodgy.race with one winner',
    test: function () {
      var
        result = [],
        a = new Dodgy(function (res, rej, onAbort) {
          setTimeout(res, 100, 123);
          onAbort(function () {
            result.push('a');
          });
        }),
        b = new Dodgy(function (res, rej, onAbort) {
          onAbort(function () {
            result.push('b');
          });
        }),
        race = Dodgy.race([a, b]).then(wru.async(function () {
          wru.assert('b was canceled', result.join('') === 'b');
        }))
      ;
    }
  }, {
    name: 'Resolvable but not abortable',
    test: function () {
      var
        d = new Dodgy(function (res, rej) {
          // should trigger too late
          setTimeout(function () {
            res(1);
          }, 100);
        }, true).then(wru.async(function (v) {
          wru.assert('expected 2, got ' + v, v === 2);
          setTimeout(wru.async(function (v) {
            wru.assert('OK');
            d.then(wru.async(function (v) {
              wru.assert('expected 2, got ' + v, v === 2);
              return v;
            }));
          }), 200);
          return v;
        }))
      ;
      wru.assert('abort is not set', !d.abort);
      // should resolve
      setTimeout(function () {
        d.resolve(2);
      }, 10);
    }
  }
]);
