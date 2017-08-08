/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var isTeamLeaderOrManager = require('../../../api/policies/isTeamLeaderOrManager.js')
var sinon = require('sinon')
var assert = require('assert')
var sailsMock = require('sails-mock-models')

describe('policies/isTeamLeaderOrManager', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })
  it('should return true if the user is the racer, accessing own data', function (done) {
    var req = { params: { id: '3' }, session: { racerInfo: { id: 3, email: 'info@beardude.com', team: { id: 1, leader: 3 } } } }
    var res = { forbidden: function (str) { return str } }
    var actual
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'verified'

    isTeamLeaderOrManager(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
  it('should return true if manager accessing team data', function (done) {
    var req = { params: { id: '3' }, session: { managerInfo: { id: 3, email: 'info@beardude.com' } } }
    var res = { forbidden: function (str) { return str } }
    var actual
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'verified'
    var mock = { id: 3, email: 'info@beardude.com', isActive: true }

    sailsMock.mockModel(Manager, 'findOne', mock)
    isTeamLeaderOrManager(req, res, callbackFunc)
    this.timeout(100)
    setTimeout(function () {
      assert.equal(actual, expected)
      Manager.findOne.restore()
      done()
    }, 50)
  })
  it('should return false if not a racer', function (done) {
    var req = { params: { id: '3' }, session: {} }
    var res = { forbidden: function (str) { actual = str } }
    var actual
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'Login required'

    isTeamLeaderOrManager(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
  it('should return false if not a racer', function (done) {
    var req = { params: { id: '3' }, session: { managerInfo: { id: 3, email: 'info@beardude.com' } } }
    var res = { forbidden: function (str) { actual = str } }
    var actual
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'Unauthorized'
    var mock = {}

    sailsMock.mockModel(Manager, 'findOne', mock)
    isTeamLeaderOrManager(req, res, callbackFunc)
    this.timeout(100)
    setTimeout(function () {
      assert.equal(actual, expected)
      Manager.findOne.restore()
      done()
    }, 50)
  })
})
