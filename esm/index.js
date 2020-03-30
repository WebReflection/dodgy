function Dodgy(callback, resolvable) {
  var
    resolve, reject, abort,
    status = 'pending',
    dog = new Promise(function (res, rej) {
      callback(
        resolve = function (value) {
          if (status === 'pending') {
            status = 'resolved';
            dog.status = status;
            res(value);
          }
        },
        reject = function (value) {
          if (status === 'pending') {
            status = 'rejected';
            dog.status = status;
            rej(value);
          }
        },
        function onAbort(callback) {
          abort = function (reason) {
            if (status === 'pending') {
              status = 'aborted';
              dog.status = status;
              rej(callback(reason));
            }
          };
        }
      );
    })
  ;
  return evolved(dog, resolvable, abort, resolve, reject);
}

function evolved(dog, resolvable, abort, resolve, reject) {
  var
    currentThen = dog.then,
    currentCatch = dog.catch
  ;
  if (abort) dog.abort = abort;
  if (resolvable) {
    dog.resolve = resolve;
    dog.reject = reject;
  }
  dog.then = function () {
    return evolved(
      currentThen.apply(dog, arguments),
      resolvable, abort, resolve, reject
    );
  };
  dog['catch'] = function () {
    return evolved(
      currentCatch.apply(dog, arguments),
      resolvable, abort, resolve, reject
    );
  };
  return dog;
}

Dodgy.race = function (iterable) {
  var dog = Promise.race(iterable).then(abort);
  function abort(result) {
    for (var i = 0; i < iterable.length; i++) {
      if ('abort' in iterable[i]) iterable[i].abort();
    }
    return result;
  }
  dog.abort = abort;
  return dog;
};

export default Dodgy;
export { Dodgy };
