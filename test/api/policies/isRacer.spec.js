/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it */

var isRacer = require('../../../api/policies/isRacer.js')
var sinon = require('sinon')
var assert = require('assert')

describe('policies/isRacer', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should return true if the user is an active racer', function (done) {
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
      actual = 'verified'
    }
    var res = {
      forbidden: function (str) {
        return str
      }
    }
    var expected = 'verified'

    isRacer(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })

  it('should return Login required if no session data found', function (done) {
    var req = {
      session: {}
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
    var expected = 'Login required'

    isRacer(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
})
