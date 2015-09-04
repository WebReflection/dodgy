Dodgy [![build status](https://secure.travis-ci.org/WebReflection/dodgy.svg)](http://travis-ci.org/WebReflection/dodgy)
=====

The idea behind this module has been explained in [my good old blog](http://webreflection.blogspot.co.uk/2015/09/on-cancelable-promises.html),
and was [born after the following gist](https://gist.github.com/WebReflection/796d1f04b1173fbcfe5a#file-lie-js) as improved and well tested 30 LOC "_life saver_".

### How to opt in for .abort([optionalValue])
In order to be make a promise cancelable we need to invoke the third argument which is a callback expecting to know what to do in case of abort.
```js
var Dodgy = require('dodgy').Promise;

var p = new Dodgy(function (res, rej, onAbort) {
  var t = setTimeout(res, 1000, 'OK');
  onAbort(function (butWhy) {
    clearTimeout(t);
    return butWhy || 'because';
  });
});

p.then(
  console.log.bind(console),
  console.warn.bind(console)  // <- .abort()
).catch(
  console.error.bind(console)
);

// at any time later on
p.abort('not needed anynmore');

```

### How to opt in as externally resolvable
Canceling a Promise is one thing, resolving it externally is a whole new "_dodger_" level but we can explicitly opt in if that's needed.
```js
var p = new Dodgy(
  function (res, rej, optInAbort) {
    // we still need to opt in for abortability
    // simply invoke the third argument
    // passing a "no-op" function, if needed
    optInAbort(Object); // Object would do
  },
  true  // <- go dodger !!!
);

// our p now will have 3 methods:
p.resolve;
p.reject;
p.abort;
```
At this point we can fully control our Promise, proudly riding the edges of nonsense-land!

### Chainability
We can `p.then().catch()` as much as we like, all control methods will be propagated down the road.

### Compatibility
Every browser and JavaScript engine, but the Promise polyfill is not included.
Try [es6-promise](https://github.com/jakearchibald/es6-promise) if you want, it worked for my [tests on IE8 too](http://webreflection.github.io/dodgy/test/).

### Which file?
`npm install dodgy` for modules, [build folder](build/) for all other versions.

### Which license?
The MIT style License