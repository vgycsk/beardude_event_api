/* eslint-disable no-magic-numbers, max-lines */
/* global afterEach, beforeEach, dataService, describe, Event, it, Race */

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
      var req = { body: { event: 1, group: 5, name: 'new race', racerNumberAllowed: 60, requirePacer: true } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 8, event: 1, group: 5, name: 'new race', racerNumberAllowed: 60, requirePacer: true }
      var mockEvent = { id: 1, raceOrder: [] }
      var mockEventUpdate = [ { id: 1, raceOrder: [8] } ]
      var expected = { races: [mockData] }

      sailsMock.mockModel(Race, 'create', mockData)
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      sailsMock.mockModel(Event, 'update', mockEventUpdate)
      this.timeout(90)
      raceController.create(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.create.restore()
        Event.findOne.restore()
        Event.update.restore()
        done()
      }, 50)
    })
  })

  describe('.update()', function () {
    it('should update race', function (done) {
      var actual
      var req = { body: { race: '5', laps: 28 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 5, group: 1, name: 'A race', laps: 28 }
      var mockUpdate = [ { id: 5, group: 1, name: 'A race', laps: 28 } ]
      var expected = { races: [{ id: 5, group: 1, name: 'A race', laps: 28 }] }

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
      var req = { params: { id: 5 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 8, group: { id: 5, event: 1 }, name: 'new race', startTime: '2017-10-10T08:00:00-08:00' }
      var expected = 'Cannot delete a started race'

      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(90)
      raceController.delete(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal(expected)
        Race.findOne.restore()
        done()
      }, 60)
    })
    it('should delete a race', function (done) {
      var actual
      var req = { params: { id: 5 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 8, group: 5, name: 'new race' }
      var mockEvent = { id: 1, raceOrder: [5] }
      var mockEventUpdate = [ { id: 1, raceOrder: [] } ]
      var expected = { race: { id: 5 } }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'destroy')
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      sailsMock.mockModel(Event, 'update', mockEventUpdate)
      this.timeout(90)
      raceController.delete(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.destroy.restore()
        Event.findOne.restore()
        Event.update.restore()
        done()
      }, 60)
    })
  })
  describe('.startRace()', function () {
    it('should throw error if raceStatus not init', function (done) {
      var actual
      var req = { body: { id: 1, startTime: 1507651200000 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'started' }

      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(150)
      raceController.startRace(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal('Can only start an init race')
        Race.findOne.restore()
        done()
      }, 90)
    })
    it('should throw error if Another race ongoing', function (done) {
      var actual
      var req = { body: { id: 1, startTime: 1507651200000 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'init', group: { event: 1 } }
      var mockSystem = { id: 1, key: 0, ongoingRace: 3 }
      var mockEvent = { id: 1, ongoingRace: 3 }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      sailsMock.mockModel(System, 'findOne', mockSystem)
      this.timeout(150)
      raceController.startRace(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal('Another race ongoing')
        Race.findOne.restore()
        Event.findOne.restore()
        System.findOne.restore()
        done()
      }, 90)
    })
    it('should start a race', function (done) {
      var actual
      var req = { body: { id: 1, startTime: 1507651200000 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'init', group: { event: 1 }}
      var mockEvent = { id: 1, ongoingRace: '', slaveEpcMap: {} }
      var mockSystem = { id: 1, ongoingRace: '' }
      var mockSystemUpdate = [{ id: 1, ongoingRace: 1 }]
      var mockupdate = [ { id: 1, raceStatus: 'started' } ]
      var expected = { races: [{ id: 1, raceStatus: 'started', raceStatusWithLatency: "started", startTimeWithLatency: 1507651200000 }], system: { id: 1, ongoingRace: 1, ongoingRaceWithLatency: 1 } }

      sandbox.stub(dataService, 'returnSlaveEpcMap').callsFake(function () { return {} })
      sandbox.stub(dataService, 'returnRaceResult').callsFake(function () { return [] })
      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'update', mockupdate)
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      sailsMock.mockModel(System, 'findOne', mockSystem)
      sailsMock.mockModel(System, 'update', mockSystemUpdate)
      this.timeout(150)
      raceController.startRace(req, res)
      setTimeout(function () {
        expect(actual.races[0].raceStatusWithLatency).to.equal(expected.races[0].raceStatusWithLatency)
        Race.findOne.restore()
        Race.update.restore()
        Event.findOne.restore()
        System.findOne.restore()
        System.update.restore()
        done()
      }, 90)
    })
  })

  describe('.endRace()', function () {
    it('should return error if not started', function (done) {
      var actual
      var req = { body: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'init' }

      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(90)
      raceController.endRace(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal('Can only stop a started race')
        Race.findOne.restore()
        done()
      }, 60)
    })
    it('should return error if not started', function (done) {
      var actual
      var req = { body: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'started', group: { event: 1 } }
      var mockEvent = { id: 1, ongoingRace: '' }
      var mockupdate = [ { id: 1, raceStatus: 'ended' } ]
      var mockSystemUpdate = [{ id: 1, key: 0, ongoingEvent: '', ongoingRace: '', resultLatency: 0, slaveEpcMap: {}, testIntervalMs: 1000, validIntervalMs: 10000 }]
      var expected = { races: mockupdate, system: mockSystemUpdate[0] }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'update', mockupdate)
      sailsMock.mockModel(Event, 'update', [mockEvent])
      sailsMock.mockModel(System, 'update', mockSystemUpdate)
      this.timeout(150)
      raceController.endRace(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.update.restore()
        Event.update.restore()
        System.update.restore()
        done()
      }, 90)
    })
  })
})
