/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it */

var isNotLoggedIn = require('../../../api/policies/isNotLoggedIn.js')
var sinon = require('sinon')
var assert = require('assert')

describe('policies/isNotLoggedIn', function () {
  var sandbox
  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })

  it('should return true if the manager is not logged in', function (done) {
    var req = { session: {} }
    var res = {}
    var expected = 'verified'
    var actual
    var callbackFunc = function () { actual = 'verified' }

    isNotLoggedIn(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })

  it('should return Already logged in if logged in as manager', function (done) {
    var req = {
      session: {
        managerInfo: {
          email: 'info@beardude.com',
          isActive: true
        }
      }
    }
    var actual
    var res = { badRequest: function (str) { actual = str } }
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'Already logged in'

    isNotLoggedIn(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
  it('should return true if not logged in', function (done) {
    var req = { session: {} }
    var res = {}
    var expected = 'verified'
    var actual
    var callbackFunc = function () { actual = 'verified' }

    isNotLoggedIn(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })

  it('should return Already logged in if logged in as racer', function (done) {
    var req = {
      session: {
        racerInfo: {
          email: 'info@beardude.com',
          isActive: true
        }
      }
    }
    var res = { badRequest: function (str) { actual = str } }
    var actual
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'Already logged in'

    isNotLoggedIn(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
})
