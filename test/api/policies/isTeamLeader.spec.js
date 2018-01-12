/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it */

var isTeamLeader = require('../../../api/policies/isTeamLeader.js')
var sinon = require('sinon')
var assert = require('assert')

describe('policies/isTeamLeader', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })
  //  if (req.session.racerInfo && req.session.racerInfo.isLeaderOf && req.session.racerInfo.isLeaderOf === req.body.id) {

  it('should return false if not a leader', function (done) {
    var req = { params: { id: '3' }, session: {} }
    var res = { forbidden: function (str) { actual = str } }
    var actual
    var callbackFunc = function () { actual = 'verified' }
    var expected = 'Unauthorized'

    isTeamLeader(req, res, callbackFunc)
    assert.equal(actual, expected)
    done()
  })
})
