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
  }
]);
