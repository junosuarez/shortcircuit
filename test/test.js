var chai = require('chai')
chai.should()
chai.use(require('chai-interface'))
var sinon = require('sinon')
chai.use(require('sinon-chai'))
var Q = require('q')
var K = require('ski/k')

describe('shortcircuit-promise', function () {
  var shortcircuit = require('../index')

  it('has interface', function () {
    shortcircuit.should.have.interface({
      or: Function,
      and: Function,
      not: Function,
      some: Function,
      every: Function
    })
  })

  describe('and', function () {
    var and = shortcircuit.and

    it('is rejected if there are no terms', function (done) {
      and().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves false if any of the terms is false', function (done) {
      var t1 = K(Q.resolve(true))
      var t2 = K(Q.resolve(false))

      and(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('resolves true if all of the terms are true', function (done) {
      var t1 = K(Q.resolve(true))
      var t2 = K(Q.resolve(true))

      and(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('executes terms in serial', function (done) {
      var t1 = sinon.stub().returns(Q.resolve(true))
      var t2 = sinon.stub().returns(Q.resolve(true))
      var t3 = sinon.stub().returns(Q.resolve(true))

      and(t1, t2, t3).then(function () {
        t1.should.have.been.called
        t2.should.have.been.calledAfter(t1)
        t3.should.have.been.calledAfter(t2)
      }).then(done, done)
    })

    it('only executes terms necessary', function (done) {
      var t1 = sinon.stub().returns(Q.resolve(true))
      var t2 = sinon.stub().returns(Q.resolve(false))
      var t3 = sinon.stub().returns(Q.resolve(true))

      and(t1, t2, t3).then(function () {
        t1.should.have.been.called
        t2.should.have.been.calledAfter(t1)
        t3.should.not.have.been.caled
      }).then(done, done)
    })

  })

  describe('or', function () {
    var or = shortcircuit.or

    it('is rejected if there are no terms', function (done) {
      or().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves true if any of the terms is true', function (done) {
      var t1 = K(Q.resolve(false))
      var t2 = K(Q.resolve(true))

      or(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('resolves false if all of the terms are false', function (done) {
      var t1 = K(Q.resolve(false))
      var t2 = K(Q.resolve(false))

      or(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('executes terms in serial', function (done) {
      var t1 = sinon.stub().returns(Q.resolve(false))
      var t2 = sinon.stub().returns(Q.resolve(false))
      var t3 = sinon.stub().returns(Q.resolve(false))

      or(t1, t2, t3).then(function () {
        t1.should.have.been.called
        t2.should.have.been.calledAfter(t1)
        t3.should.have.been.calledAfter(t2)
      }).then(done, done)
    })

    it('only executes terms necessary', function (done) {
      var t1 = sinon.stub().returns(Q.resolve(false))
      var t2 = sinon.stub().returns(Q.resolve(true))
      var t3 = sinon.stub().returns(Q.resolve(false))

      or(t1, t2, t3).then(function () {
        t1.should.have.been.called
        t2.should.have.been.calledAfter(t1)
        t3.should.not.have.been.caled
      }).then(done, done)
    })

    it('is rejected if any of the executed terms is rejected', function (done) {
      var err = new Error('foo')
      var t1 = sinon.stub().returns(Q.resolve(false))
      var t2 = sinon.stub().returns(Q.reject(err))

      or(t1, t2).then(function () {
        done(new Error('should not resolve'))
      }, function (e) {
        e.should.equal(err)
        done()
      })
    })
  })

  describe('not', function () {
    var not = shortcircuit.not

    it('is rejected if there are no terms', function (done) {
      not().then(null, function () { done() })
    })

    it('returns true when the term is false', function (done) {
      not(Q.resolve(false)).then(function (val) { val.should.equal(true)}).then(done, done)
    })

    it('returns false when the term is true', function (done) {
      not(Q.resolve(true)).then(function (val) { val.should.equal(false)}).then(done, done)
    })
  })

  describe('some', function () {
    var some = shortcircuit.some

    it('is rejected if there are no terms', function (done) {
      some().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves true if any of the terms is true', function (done) {
      var t1 = K(Q.resolve(true))
      var t2 = K(Q.resolve(false))

      some(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('resolves false if all of the terms are false', function (done) {
      var t1 = K(Q.resolve(false))
      var t2 = K(Q.resolve(false))

      some(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('executes all terms in parallel', function (done) {
      var t1 = sinon.stub().returns(Q.resolve(true))
      var t2 = sinon.stub().returns(Q.resolve(false))
      var t3 = sinon.stub().returns(Q.resolve(true))

      some(t1, t2, t3).then(function () {
        t1.should.have.been.called
        t2.should.have.been.called
        t3.should.have.been.caled
      }).then(done, done)
    })

  })

  describe('every', function () {
    var every = shortcircuit.every

    it('is rejected if there are no terms', function (done) {
      every().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves false if any of the terms is false', function (done) {
      var t1 = K(Q.resolve(true))
      var t2 = K(Q.resolve(false))

      every(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('resolves true if all of the terms are true', function (done) {
      var t1 = K(Q.resolve(true))
      var t2 = K(Q.resolve(true))

      every(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('executes all terms in parallel', function (done) {
      var t1 = sinon.stub().returns(Q.resolve(true))
      var t2 = sinon.stub().returns(Q.resolve(false))
      var t3 = sinon.stub().returns(Q.resolve(true))

      every(t1, t2, t3).then(function () {
        t1.should.have.been.called
        t2.should.have.been.called
        t3.should.have.been.called
      }).then(done, done)
    })

  })

})