/*!
Copyright (C) 2015 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
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
module.exports = Dodgy;
Dodgy.Promise = Dodgy;