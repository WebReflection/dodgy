function Dodgy(callback, resolvable) {
  var
    resolve, reject, abort, done = false,
    dog = new Promise(function (res, rej) {
      callback(
        resolve = function resolve(how) { done = true; res(how); },
        reject = function reject(why) { done = true; rej(why); },
        function onAbort(callback) {
          abort = function abort(why) {
            if (!done) reject(callback((done = true) && why));
          };
        });
    });
  return abort ? dodger(dog, !!resolvable, resolve, reject, abort) : dog;
}
function dodger(dog, resolvable, resolve, reject, abort) {
  function wrap(previous) {
    return function () { return dodger(
      previous.apply(dog, arguments), resolvable, resolve, reject, abort);
    };
  }
  dog.then = wrap(dog.then);
  dog['catch'] = wrap(dog['catch']);
  dog.abort = abort;
  if (resolvable) {
    dog.resolve = resolve;
    dog.reject = reject;
  }
  return dog;
}