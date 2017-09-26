/* eslint-disable no-magic-numbers */
/* global describe, Event, Group, Race, Registration, it */

var eventController = require('../../../api/controllers/EventController.js')
var sailsMock = require('sails-mock-models')
var chai = require('chai')
var expect = chai.expect

describe('/controllers/EventController', function () {
  describe('.create()', function () {
    it('should create an event under current manager', function (done) {
      var actual
      var req = {
        body: { name: 'new event', nameCht: '新比賽', startTime: '2017-10-10T08:00:00-08:00', endTime: '2017-10-10T16:00:00-08:00', lapDistance: 1100, location: 'Taipei' },
        session: { managerInfo: { id: 1, email: 'info@beardude.com' }
        }
      }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = req.body
      var mockDataManager = { id: 1, managers: { add: function () { return true } }, save: function () { return true } }
      var expected = { event: { name: 'new event', uniqueName: 'newevent', nameCht: '新比賽', startTime: 1507651200000, endTime: 1507680000000, lapDistance: 1100, location: 'Taipei', managerIds: [1] } }

      this.timeout(99)
      sailsMock.mockModel(Event, 'create', mockData)
      sailsMock.mockModel(Event, 'findOne', mockDataManager)
      eventController.create(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Event.create.restore()
        Event.findOne.restore()
        done()
      }, 30)
    })
  })
  describe('.getEvents()', function () {
    it('should return filtered events info to public', function (done) {
      var actual
      var req = { session: {} }
      var res = {
        ok: function (obj) { actual = obj },
        badRequest: function (obj) { actual = obj }
      }
      var mockData = [
        {
          id: 1,
          name: 'new event',
          nameCht: '新活動',
          isPublic: true,
          isIndieEvent: false
        },
        {
          id: 2,
          name: 'new event 2',
          nameCht: '新活動 2',
          isPublic: false,
          isIndieEvent: false
        },
        {
          id: 2,
          name: 'new event 3',
          nameCht: '新活動 3',
          isPublic: true,
          isIndieEvent: true
        }
      ]
      var expected = { events: [{
          id: 1,
          name: 'new event',
          nameCht: '新活動',
          isPublic: true,
          isIndieEvent: false
        }] }

      this.timeout(99)
      sailsMock.mockModel(Event, 'find', mockData)
      eventController.getEvents(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Event.find.restore()
        done()
      }, 30)
    })
    it('should return all events info to manager', function (done) {
      var actual
      var req = { session: { managerInfo: { id: 1, email: 'info@beardude.com' } } }
      var res = {
        ok: function (obj) { actual = obj },
        badRequest: function (obj) { actual = obj }
      }
      var mockData = [
        {
          id: 1,
          name: 'new event',
          nameCht: '新活動',
          isPublic: true,
          isIndieEvent: false
        },
        {
          id: 2,
          name: 'new event 2',
          nameCht: '新活動 2',
          isPublic: false,
          isIndieEvent: false
        },
        {
          id: 2,
          name: 'new event 3',
          nameCht: '新活動 3',
          isPublic: true,
          isIndieEvent: true
        }
      ]
      var expected = { events: mockData }

      this.timeout(99)
      sailsMock.mockModel(Event, 'find', mockData)
      eventController.getEvents(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Event.find.restore()
        done()
      }, 30)
    })
  })
  describe('.getInfo()', function () {
    it('should return event info if found', function (done) {
      var actual
      var req = { params: { id: '1' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new event', nameCht: '新活動', raceOrder: [1, 2] }
      var mockGroups = [ { id: 1, name: 'Group1', nameCht: '組別1' }, { id: 2, name: 'Group2', nameCht: '組別2' } ]
      var mockRaces = [ { id: 1, name: 'Race1', nameCht: 'Race1' }, { id: 2, name: 'Race2', nameCht: 'Race2' } ]
      var mockRegs = [ { id: 1, name: 'reg1' }, { id: 2, name: 'reg' } ]
      var expected = { event: mockData, groups: mockGroups, races: mockRaces, registrations: mockRegs }
      this.timeout(150)
      sailsMock.mockModel(Event, 'findOne', mockData)
      sailsMock.mockModel(Group, 'find', mockGroups)
      sailsMock.mockModel(Race, 'find', mockRaces)
      sailsMock.mockModel(Registration, 'find', mockRegs)
      eventController.getInfo(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Event.findOne.restore()
        Group.find.restore()
        Race.find.restore()
        Registration.find.restore()
        done()
      }, 90)
    })
  })
  describe('.update()', function () {
    it('should update specified fields', function (done) {
      var actual
      var req = { body: { name: 'new event1', assignedRaceNumber: 50 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = req.body
      var mockDataUpdate = [ { id: 1, name: 'new event1', assignedRaceNumber: 50 } ]
      var expected = { event: mockDataUpdate[0] }

      mockData.id = 1
      this.timeout(99)
      sailsMock.mockModel(Event, 'create', mockData)
      sailsMock.mockModel(Event, 'update', mockDataUpdate)
      eventController.update(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Event.create.restore()
        Event.update.restore()
        done()
      }, 30)
    })
  })
  describe('.delete()', function () {
    it('should return error if is an ongoing event', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new event1', isPublic: false, startTime: Date.now() - 10000, endTime: Date.now() + 10000 }

      this.timeout(150)
      sailsMock.mockModel(Event, 'findOne', mockData)
      eventController.delete(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal('Cannot delete an ongoing event')
        Event.findOne.restore()
        done()
      }, 90)
    })
    it('should return error if event contains groups', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new event1', isPublic: false, startTime: 1507651200000, endTime: 1507680000000, groups: [ { id: 1, name: 'group1' } ] }

      this.timeout(150)
      sailsMock.mockModel(Event, 'findOne', mockData)
      sailsMock.mockModel(Group, 'count', 2)
      eventController.delete(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal('Cannot delete an event that contains group')
        Event.findOne.restore()
        Group.count.restore()
        done()
      }, 90)
    })
    it('should delete event', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new event1', isPublic: false, startTime: 1507651200000, endTime: 1507680000000, groups: [] }

      this.timeout(150)
      sailsMock.mockModel(Event, 'findOne', mockData)
      sailsMock.mockModel(Event, 'destroy', { id: 1 })
      eventController.delete(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal({ event: { id: 1 } })
        Event.findOne.restore()
        Event.destroy.restore()
        done()
      }, 90)
    })
  })
})
