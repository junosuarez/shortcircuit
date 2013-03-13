# shortcircuit
asynchronous short circuit evaluation

> "Nature operates in the shortest way possible."
-Aristotle

## installation

    $ npm install shortcircuit

## usage
```js
    var shortcircuit = require('shortcircuit')
    var or = shortcircuit.or
    var and = shortcircuit.and
    var not = shortcircuit.not
    var every = shortcircuit.every
    var some = shortcircuit.some
    var Q = require('your favorite promises implementation')

    function userIsAuthenticated () {
      return Q.resolve(true)
    }

    weGetSignal = Q.resolve(true)

    weAreReady = false

    shortcircuit.or(weAreReady, weGetSignal, userIsAuthenticated, weGetSignal)
    // => Promise<true>,
    // terms evaluated in serial, so userIsAuthenticated not called



    shortcircuit.some(weAreReady, userIsAuthenticated, weGetSignal)
    // => Promise<true>,
    // terms evaluated in parallel, so userIsAuthenticated is called


    shortcircuit.all(weAreReady, userIsAuthenticated, weGetSignal)
    // => Promise<false>,
    // terms evaluated in serial so userIsAuthenticated is not called


    shortcircuit.every(weAreReady, userIsAuthenticated, weGetSignal))
    // => Promise<false>,
    // terms evaluated in parallel, so userIsAuthenticated is not called


    shortcircuit.not(userIsAuthenticated)
    // => Promise<false>

```

## about

`shortcircuit` helps you compose boolean values, boolean promises, and continuations (functions without parameters) returning booleans or boolean promises.

In synchronous code, it can be useful to depend on operator precedence for control flow, for example, to evaluate a function depending on a certain value:

    var showPage = (userIsAuthenticated() && userIsAuthorized()) || todayIsTuesday;

In this case, we would only have to check for authorization if the user passes the first condition. This kind of logic is very clear in synchronous code, but can be obscured in callbacks in async code.

Now, we could have those be promise-returning functions and write:

    var showPage = shortcircuit.or(todayIsTuesday, shortcircuit.and(userIsAuthenticated, userIsAuthorized))

where userIsAuthenticated is a function which returns a promise. Here, if the term is necessary to evaluate the overall truth of the statement, `shortcircuit` will invoke the function and await the promised value.

In cases where there are no side effects and latency is more important than economy of computation, you can evaluate the terms in parallel.

And of course, you have first call support for error propagation through `promise.reject`.

## see also

[connective](https://npmjs.org/package/connective) offers similar composable semantics for synchronous predicate functions.

## running the tests

    $ npm install
    $ npm test

## contributors

jden <jason@denizac.org>

## license
MIT. (c) 2013 Agile Diagnosis. See LICENSE.md
