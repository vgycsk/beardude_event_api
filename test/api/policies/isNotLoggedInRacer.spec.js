/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it */

var isNotLoggedInRacer = require('../../../api/policies/isNotLoggedInRacer.js')
var sinon = require('sinon')
var assert = require('assert')

describe('policies/isNotLoggedInRacer', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should return true if the user is not logged in', function (done) {
    var req = {
      session: {}
    }
    var res = {}
    var expected = 'verified'
    var actual
    var callbackFunc = function () {
      actual = 'verified'
    }

    isNotLoggedInRacer(req, res, callbackFunc)
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
    var actual
    var callbackFunc = function () {
      return 'verified'
    }
    var res = {
      forbidden: function (str) {
        actual = str
      }
    }
    var expected = 'Already logged in'

    isNotLoggedInRacer(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
})
