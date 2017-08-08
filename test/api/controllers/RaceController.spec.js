/* eslint-disable no-magic-numbers, max-lines */
/* global afterEach, beforeEach, describe, it, Race */

var raceController = require('../../../api/controllers/RaceController.js')
var sinon = require('sinon')
var sailsMock = require('sails-mock-models')
var chai = require('chai')
var expect = chai.expect

describe('/controllers/RaceController', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })
  describe('.create()', function () {
    it('should create a race', function (done) {
      var actual
      var req = { body: { group: 5, name: 'new race', racerNumberAllowed: 60, requirePacer: true } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 8, group: 5, name: 'new race', racerNumberAllowed: 60, requirePacer: true }
      var expected = { race: mockData }

      sailsMock.mockModel(Race, 'create', mockData)
      this.timeout(50)
      raceController.create(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.create.restore()
        done()
      }, 30)
    })
  })

  describe('.getInfo()', function () {
    it('should return filtered race info', function (done) {
      var actual
      var req = { params: { id: '5' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 5, registrations: [1, 2, 3], group: 1, name: 'A race' }
      var expected = { race: { id: 5, registrations: [1, 2, 3], group: 1, name: 'A race' } }

      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(50)
      raceController.getInfo(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        done()
      }, 30)
    })
  })
  describe('.update()', function () {
    it('should update race', function (done) {
      var actual
      var req = { body: { race: '5', laps: 28 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 5, group: 1, name: 'A race', laps: 28 }
      var mockUpdate = [ { id: 5, group: 1, name: 'A race', laps: 28 } ]
      var expected = { race: { id: 5, group: 1, name: 'A race', laps: 28 } }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'update', mockUpdate)
      this.timeout(100)
      raceController.update(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.update.restore()
        done()
      }, 50)
    })
  })
  describe('.delete()', function () {
    it('return error when trying to delete a started race', function (done) {
      var actual
      var req = { params: { id: '5' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 8, group: 5, name: 'new race', startTime: '2017-10-10T08:00:00-08:00' }
      var expected = 'Cannot delete a started race'

      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(50)
      raceController.delete(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal(expected)
        Race.findOne.restore()
        done()
      }, 30)
    })
    it('should delete a race', function (done) {
      var actual
      var req = { params: { id: '5' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 8, group: 5, name: 'new race' }
      var expected = { id: 5 }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'destroy')
      this.timeout(50)
      raceController.delete(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.destroy.restore()
        done()
      }, 30)
    })
  })
  /*
  describe('.addRemoveRegs()', function () {
    it('should return error if racer not in group', function (done) {
    })
  })

  describe('.assignRegsToRaces()', function () {
  })
  describe('.startRace()', function () {
    it('should return error if rules not continuous', function (done) {

    })
  })
  describe('.resetRace()', function () {
    it('should return error if rules not continuous', function (done) {

    })
  })
  describe('.endRace()', function () {
    it('should return error if rules not continuous', function (done) {

    })
  })
  describe('.submitResult()', function () {
    it('should submit race result and advance qualified racers to coming races', function (done) {
    })
  })
  describe('.socketManagement()', function () {
    it('should submit race result and advance qualified racers to coming races', function (done) {
    })
  })
  describe('.socketImpinj()', function () {
    it('should submit race result and advance qualified racers to coming races', function (done) {
    })
  })
  describe('.socket()', function () {
    it('should submit race result and advance qualified racers to coming races', function (done) {
    })
  })
  describe('.insertRfid()', function () {
    it('should submit race result and advance qualified racers to coming races', function (done) {
    })
  })
  */
})
