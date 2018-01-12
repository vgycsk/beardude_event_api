/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var isManager = require('../../../api/policies/isManager.js')
var sinon = require('sinon')
var assert = require('assert')
var sailsMock = require('sails-mock-models')

describe('policies/isManager', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should return true if the user is a manager', function (done) {
    var req = {
      session: {
        managerInfo: {
          email: 'info@beardude.com'
        }
      }
    }
    var res = {
      forbidden: function (str) {
        return str
      }
    }
    var mockData = {
      id: 1,
      email: 'info@beardude.com'
    }
    var callbackFunc = function () {
      return 'verified'
    }
    var expected

    sailsMock.mockModel(Manager, 'findOne', mockData)
    isManager(req, res, callbackFunc)
        .then(function (actual) {
          expected = 'verified'
          assert.equal(actual, expected)
          Manager.findOne.restore()
          done()
        })
  })

  it('should return -Unauthorized if no session data found', function (done) {
    var req = {
      session: {}
    }
    var actual
    var res = {
      forbidden: function (str) {
        actual = str
      }
    }
    var mockData
    var callbackFunc = function () {
      return 'verified'
    }
    var expected = 'Unauthorized'

    sailsMock.mockModel(Manager, 'findOne', mockData)
    isManager(req, res, callbackFunc)
    assert.equal(actual, expected)
    Manager.findOne.restore()
    done()
  })
})
