function Dodgy(callback, resolvable) {
  var
    resolve, reject, abort,
    dog = new Promise(function (res, rej) {
      callback(res, rej, function onAbort(callback) {
        resolve = res;
        reject = rej;
        abort = function abort() { reject(callback.apply(null, arguments)); };
      });
    })
  ;
  return abort ? dodger(dog, !!resolvable, resolve, reject, abort) : dog;
}
function dodger(dog, resolvable, resolve, reject, abort) {
  function wrap(previous) {
    return function () {
      return dodger(
        previous.apply(dog, arguments),
        resolvable, resolve, reject, abort);
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