/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var isActiveManager = require('../../../api/policies/isActiveManager.js')
var sinon = require('sinon')
var assert = require('assert')
var sailsMock = require('sails-mock-models')

describe('policies/isActiveManager', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should return true if the user is an active manager', function (done) {
    var req = {
      session: {
        managerInfo: {
          email: 'info@beardude.com',
          isActive: true
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
      email: 'info@beardude.com',
      isActive: true
    }
    var callbackFunc = function () {
      return 'verified'
    }
    var expected

    sailsMock.mockModel(Manager, 'findOne', mockData)
    isActiveManager(req, res, callbackFunc)
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
    isActiveManager(req, res, callbackFunc)
    assert.equal(actual, expected)
    Manager.findOne.restore()
    done()
  })

  it('should return forbidden if manager is updated inActive', function (done) {
    var req = {
      session: {
        managerInfo: {
          email: 'info@beardude.com',
          isActive: true
        }
      }
    }
    var actual
    var res = {
      forbidden: function (str) {
        actual = str
      }
    }
    var mockData = {
      email: 'info@beardude.com',
      isActive: false
    }
    var callbackFunc = function () {
      return 'verified'
    }
    var expected = 'Unauthorized'

    this.timeout(50)
    sailsMock.mockModel(Manager, 'findOne', mockData)
    isActiveManager(req, res, callbackFunc)
    setTimeout(function () {
      assert.equal(actual, expected)
      Manager.findOne.restore()
      done()
    }, 30)
  })
})
