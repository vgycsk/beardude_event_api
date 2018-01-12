/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Team */

var teamController = require('../../../api/controllers/TeamController.js')
var sailsMock = require('sails-mock-models')
var chai = require('chai')
var expect = chai.expect
var sinon = require('sinon')

describe('/controllers/TeamController', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })

  describe('.update()', function () {
    it('should update changed fields', function (done) {
      var actual
      var req = { body: { name: 'new team name' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new team', nameCht: '新隊伍', leader: 1 }
      var mockUpdate = [ { id: 1, name: 'new team name', nameCht: '新隊伍', leader: 1 } ]
      var expected = { team: { id: 1, name: 'new team name', nameCht: '新隊伍', leader: 1 } }

      this.timeout(99)
      sailsMock.mockModel(Team, 'findOne', mockData)
      sailsMock.mockModel(Team, 'update', mockUpdate)
      teamController.update(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Team.findOne.restore()
        Team.update.restore()
        done()
      }, 50)
    })
  })
})
