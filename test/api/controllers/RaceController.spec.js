/* eslint-disable no-magic-numbers, max-lines */
/* global afterEach, beforeEach, dataService, describe, Event, it, Race */

var raceController = require('../../../api/controllers/RaceController.js')
var sinon = require('sinon')
var sailsMock = require('sails-mock-models')
var chai = require('chai')
var expect = chai.expect
var Q = require('q')

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
      var req = { params: { id: 5 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 8, group: 5, name: 'new race', startTime: '2017-10-10T08:00:00-08:00' }
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
      var expected = { id: 5 }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'destroy')
      this.timeout(90)
      raceController.delete(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.destroy.restore()
        done()
      }, 60)
    })
  })
  describe('.addRemoveRegs()', function () {
    it('should do nothing if no regs present', function (done) {
      var mock = { id: 1, registrations: [] }
      var actual
      var raceObj = { toAdd: [], toRemove: [] }
      sandbox.stub(Q, 'defer').callsFake(function () {
        return { promise: function () {}, resolve: function () { actual = true }, reject: function () {} }
      })
      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(90)
      raceController.addRemoveRegs(raceObj)
      setTimeout(function () {
        expect(actual).to.equal(true)
        Race.findOne.restore()
        done()
      }, 60)
    })
    it('should add regs', function (done) {
      var mock = { id: 1, registrations: [] }
      var actual
      var raceObj = { toAdd: [1], toRemove: [] }
      mock.registrations.add = function () { actual = true }
      sandbox.stub(Q, 'defer').callsFake(function () {
        return { promise: function () {}, resolve: function () { actual = true }, reject: function () {} }
      })
      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(90)
      raceController.addRemoveRegs(raceObj)
      setTimeout(function () {
        expect(actual).to.equal(true)
        Race.findOne.restore()
        done()
      }, 60)
    })
    it('should remove regs', function (done) {
      var mock = { id: 1, registrations: [] }
      var actual
      var raceObj = { toAdd: [], toRemove: [1] }
      mock.registrations.remove = function () { actual = true }
      sandbox.stub(Q, 'defer').callsFake(function () {
        return { promise: function () {}, resolve: function () { actual = true }, reject: function () {} }
      })
      sailsMock.mockModel(Race, 'findOne', mock)
      this.timeout(90)
      raceController.addRemoveRegs(raceObj)
      setTimeout(function () {
        expect(actual).to.equal(true)
        Race.findOne.restore()
        done()
      }, 60)
    })
  })
  describe('.assignRegsToRaces()', function () {
    it('should call addRemoveRegs', function (done) {
      var actual
      var req = { body: { races: [ { id: 1, toAdd: [1] }, { id: 2, toRemove: [1] } ] } }
      var res = { ok: function (obj) { actual = true }, badRequest: function (obj) { actual = true } }
      var RaceController = { addRemoveRegs: function () { return true } }

      sandbox.stub(RaceController, 'addRemoveRegs').callsFake(function () { actual = true })
      this.timeout(200)
      raceController.assignRegsToRaces(req, res)
      setTimeout(function () {
        expect(actual).to.equal(true)
        done()
      }, 150)
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
      var mockEvent = { id: 1, ongoingRace: 3 }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      this.timeout(150)
      raceController.startRace(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal('Another race ongoing')
        Race.findOne.restore()
        Event.findOne.restore()
        done()
      }, 90)
    })
    it('should start a race', function (done) {
      var actual
      var req = { body: { id: 1, startTime: 1507651200000 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'init', group: { event: 1 } }
      var mockEvent = { id: 1, ongoingRace: -1 }
      var mockupdate = [ { id: 1, raceStatus: 'started' } ]
      var expected = { race: { id: 1, raceStatus: 'started' } }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'update', mockupdate)
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      this.timeout(150)
      raceController.startRace(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.update.restore()
        Event.findOne.restore()
        done()
      }, 90)
    })
  })
  describe('.resetRace()', function () {
    it('should reset a race', function (done) {
      var actual
      var req = { body: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, raceStatus: 'init', group: { event: 1 } }
      var mockEvent = { id: 1, ongoingRace: -1 }
      var mockupdate = [ { id: 1, raceStatus: 'init' } ]
      var expected = { race: { id: 1, raceStatus: 'init' } }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'update', mockupdate)
      sailsMock.mockModel(Event, 'findOne', mockEvent)
      sailsMock.mockModel(Event, 'update', [mockEvent])
      this.timeout(150)
      raceController.resetRace(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.update.restore()
        Event.findOne.restore()
        Event.update.restore()
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
      var mockEvent = { id: 1, ongoingRace: -1 }
      var mockupdate = [ { id: 1, raceStatus: 'ended' } ]
      var expected = { race: mockupdate[0] }

      sailsMock.mockModel(Race, 'findOne', mock)
      sailsMock.mockModel(Race, 'update', mockupdate)
      sailsMock.mockModel(Event, 'update', [mockEvent])
      this.timeout(150)
      raceController.endRace(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.findOne.restore()
        Race.update.restore()
        Event.update.restore()
        done()
      }, 90)
    })
  })
  describe('.submitResult()', function () {
    it('should submit race result and advance qualified racers to coming races', function (done) {
      //  // { id: ID, result: [], advance: []}
      var actual
      var req = { body: { id: 1, result: [ { id: 1 }, { id: 2 } ], advance: [] } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var RaceController = { addRemoveRegs: function () { return true } }
      var mockUpdate = {}
      var expected = { race: { id: 1 } }

      sandbox.stub(RaceController, 'addRemoveRegs').callsFake(function () {})
      sailsMock.mockModel(Race, 'update', mockUpdate)
      this.timeout(200)
      raceController.submitResult(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Race.update.restore()
        done()
      }, 150)
    })
  })
  describe('.insertRfid()', function () {
    it('should not insert record if event not found', function (done) {
      var actual
      var eventId = 1
      var entriesRaw = [ { epc: 'abc123', timestamp: '1507651200000' } ]
      sandbox.stub(Q, 'defer').callsFake(function () {
        return { resolve: function (obj) { actual = obj }, reject: function (obj) { actual = obj } }
      })
      sailsMock.mockModel(Event, 'findOne')
      this.timeout(150)
      raceController.insertRfid(eventId, entriesRaw)
      setTimeout(function () {
        expect(actual).to.deep.equal(false)
        Event.findOne.restore()
        done()
      }, 90)
    })
    it('should not insert record to race if no ongoing race', function (done) {
      var actual
      var eventId = 1
      var entriesRaw = [ { epc: 'abc123', timestamp: '1507651200000' } ]
      var mock = { id: 1, ongoingRace: -1, rawRfidData: [ { epc: 'aaa', timestamp: '1507651100000' } ] }
      var mockUpdate = [ mock ]
      sandbox.stub(Q, 'defer').callsFake(function () {
        return { resolve: function (obj) { actual = obj }, reject: function (obj) { actual = obj } }
      })
      sailsMock.mockModel(Event, 'findOne', mock)
      sailsMock.mockModel(Event, 'update', mockUpdate)
      this.timeout(150)
      raceController.insertRfid(eventId, entriesRaw)
      setTimeout(function () {
        expect(actual).to.deep.equal(false)
        Event.findOne.restore()
        Event.update.restore()
        done()
      }, 90)
    })
    /*

    */
  })
  describe('.insertRfidToRace()', function () {
    it('should not insert record to race if not a valid record', function (done) {
      var actual
      var raceId = 'abc'
      var entries = [ { epc: 'abc123', timestamp: 1507651100000 } ]
      var mockRace = { id: 1, recordsHashTable: { abc123: [], aaa: [] } }
      var mockRaceUpdate = [ { id: 1, recordsHashTable: { abc123: [], aaa: [] } } ]

      sandbox.stub(Q, 'defer').callsFake(function () {
        return { resolve: function (obj) { actual = obj }, reject: function (obj) { actual = obj } }
      })
      sandbox.stub(dataService, 'isValidRaceRecord').callsFake(function () { return false })
      sailsMock.mockModel(Race, 'findOne', mockRace)
      sailsMock.mockModel(Race, 'update', mockRaceUpdate)
      this.timeout(150)
      raceController.insertRfidToRace(raceId, entries)
      setTimeout(function () {
        expect(actual).to.equal(false)
        Race.findOne.restore()
        Race.update.restore()
        done()
      }, 90)
    })
    it('should not insert record to race if interval too short', function (done) {
      var actual
      var raceId = 'abc'
      var entries = [ { epc: 'abc123', timestamp: 1507651100000 } ]
      var mockRace = { id: 1, recordsHashTable: { abc123: [ 1507651099900 ], aaa: [] } }
      var mockRaceUpdate = [ { id: 1, recordsHashTable: { abc123: [], aaa: [] } } ]

      sandbox.stub(Q, 'defer').callsFake(function () {
        return { resolve: function (obj) { actual = obj }, reject: function (obj) { actual = obj } }
      })
      sandbox.stub(dataService, 'isValidRaceRecord').callsFake(function () { return true })
      sailsMock.mockModel(Race, 'findOne', mockRace)
      sailsMock.mockModel(Race, 'update', mockRaceUpdate)
      this.timeout(150)
      raceController.insertRfidToRace(raceId, entries)
      setTimeout(function () {
        expect(actual).to.equal(false)
        Race.findOne.restore()
        Race.update.restore()
        done()
      }, 90)
    })
    it('should insert record if valid', function (done) {
      var actual
      var raceId = 'abc'
      var entries = [ { epc: 'abc123', timestamp: 1507651100000 } ]
      var mockRace = { id: 'abc', recordsHashTable: { abc123: [ 1507651000000 ], aaa: [] } }
      var mockRaceUpdate = [ { id: 'abc', recordsHashTable: { abc123: [ 1507651000000, 1507651100000 ], aaa: [] } } ]
      sandbox.stub(Q, 'defer').callsFake(function () {
        return { resolve: function (obj) { actual = obj }, reject: function (obj) { actual = obj } }
      })
      sandbox.stub(dataService, 'isValidRaceRecord').callsFake(function () { return true })
      sailsMock.mockModel(Race, 'findOne', mockRace)
      sailsMock.mockModel(Race, 'update', mockRaceUpdate)
      this.timeout(150)
      raceController.insertRfidToRace(raceId, entries)
      setTimeout(function () {
        expect(actual).to.deep.equal({ race: mockRaceUpdate[0] })
        Race.findOne.restore()
        Race.update.restore()
        done()
      }, 90)
    })
  })
  /*
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

  */
})
