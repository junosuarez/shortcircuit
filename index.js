var Promise = require('bluebird')
var slice = Array.prototype.slice

function isPromise(p) {
  return p && typeof p.then === 'function'
}

function pcall (p) {
  var t = typeof p
  if (t === 'boolean') return Promise.cast(p)
  if (t === 'function') return pcall(p())
  if (isPromise(p)) return p
  return Promise.resolve(Boolean(p))
}

function or () {
  var args = arguments;
  var term = args[0]
  if (!term) return Promise.reject(new Error('No terms'));
  if (args.length === 1) {
    return pcall(term).then(Boolean)
  }

  return pcall(term).then(function (val) {
    if (val) return true;
    // async recurse
    return or.apply(null, slice.call(args, 1))
  })
}

function and () {
  var args = arguments;
  var term = args[0]
  if (!term) return Promise.reject(new Error('No terms'))
  if (args.length === 1) {
    return pcall(term).then(Boolean)
  }

  return pcall(term).then(function (val) {
    if (!val) return false;
    // asycn recurse
    return and.apply(null, slice.call(args, 1))
  })
}


function some () {
  var args = arguments;
  var term = args[0]
  if (!term) return Promise.reject(new Error('No terms'))
  if (args.length === 1) {
    return pcall(term).then(Boolean)
  }

  var promises = slice.call(arguments).map(pcall)

  return Promise.all(promises).then(function (results) {
    return results.some(Boolean)
  })
}

function every () {
  var args = arguments;
  var term = args[0]
  if (!term) return Promise.reject(new Error('No terms'))
  if (args.length === 1) {
    return pcall(term).then(Boolean)
  }

  var promises = slice.call(arguments).map(pcall)

  return Promise.all(promises).then(function (results) {
    return results.every(Boolean)
  })
}


function not(term) {
  if (!term) return Promise.reject(new Error('No term'))
  return pcall(term).then(function (x) { return !x })
}

module.exports.or = or
module.exports.and = and
module.exports.not = not
module.exports.every= every
module.exports.some = some