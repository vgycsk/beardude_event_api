/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Racer */

var isActiveRacer = require('../../../api/policies/isActiveRacer.js')
var sinon = require('sinon')
var assert = require('assert')
var sailsMock = require('sails-mock-models')

describe('policies/isActiveRacer', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })

  it('should return true if the user is an active racer', function (done) {
    var req = { session: { racerInfo: { email: 'info@beardude.com', isActive: true } } }
    var mockData = { id: 1, email: 'info@beardude.com', isActive: true }
    var actual
    var callbackFunc = function () { actual = true }
    var res = { forbidden: function (str) { return str } }

    sailsMock.mockModel(Racer, 'findOne', mockData)
    this.timeout(150)
    isActiveRacer(req, res, callbackFunc)
    setTimeout(function () {
      assert.equal(actual, true)
      Racer.findOne.restore()
      done()
    }, 100)
  })
  it('should return Login required if no session data found', function (done) {
    var req = { session: {} }
    var actual
    var mockData
    var callbackFunc = function () { actual = true }
    var res = { forbidden: function (str) { actual = str } }
    sailsMock.mockModel(Racer, 'findOne', mockData)
    this.timeout(150)
    isActiveRacer(req, res, callbackFunc)
    setTimeout(function () {
      assert.equal(actual, 'Login required')
      Racer.findOne.restore()
      done()
    }, 100)
  })

  it('should return forbidden if racer is updated inActive', function (done) {
    var req = { session: { racerInfo: { email: 'info@beardude.com', isActive: true } } }
    var actual
    var mockData = { email: 'info@beardude.com', isActive: false }
    var callbackFunc = function () { actual = true }
    var res = { forbidden: function (str) { actual = str } }

    this.timeout(150)
    sailsMock.mockModel(Racer, 'findOne', mockData)
    isActiveRacer(req, res, callbackFunc)
    setTimeout(function () {
      assert.equal(actual, 'Login required or need activation')
      Racer.findOne.restore()
      done()
    }, 90)
  })
})
