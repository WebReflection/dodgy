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
module.exports = Dodgy;
Dodgy.Promise = Dodgy;