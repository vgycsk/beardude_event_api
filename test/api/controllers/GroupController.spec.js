/* eslint-disable no-magic-numbers */
/* global describe, Group, it, Race, Registration */

var groupController = require('../../../api/controllers/GroupController.js')
var sailsMock = require('sails-mock-models')
var chai = require('chai')
var expect = chai.expect

describe('/controllers/GroupController', function () {
  describe('.create()', function () {
    it('should create a group', function (done) {
      var actual
      var req = { body: { name: 'new group', nameCht: '新組別' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new group', nameCht: '新組別' }
      var expected = { group: mockData }

      this.timeout(99)
      sailsMock.mockModel(Group, 'create', mockData)
      groupController.create(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Group.create.restore()
        done()
      }, 30)
    })
  })
  /*
  describe('.getInfo()', function () {
    it('should return filtered group info', function (done) {
      var actual
      var req = { params: { id: '1' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new group' }
      var mockRace = [ { id: 1, name: 'race1' }, { id: 2, name: 'race2' } ]
      var mockDataReg = [ { id: 1, racer: { id: 1, team: 1, firstName: 'John', lastName: 'Doe' }, raceNumber: 1 } ]
      var expected = {
        group: {
          id: 1,
          name: 'new group',
          races: mockRace,
          registrations: [ { id: 1, racer: { id: 1, team: 1, firstName: 'John', lastName: 'Doe' }, raceNumber: 1 } ]
        }
      }

      mockData.toJSON = function () { return mockData }
      this.timeout(150)
      sailsMock.mockModel(Group, 'findOne', mockData)
      sailsMock.mockModel(Race, 'find', mockRace)
      sailsMock.mockModel(Registration, 'find', mockDataReg)
      groupController.getInfo(req, res)
      setTimeout(function () {
        delete mockData.toJSON
        expect(actual).to.deep.equal(expected)
        Group.findOne.restore()
        Race.find.restore()
        Registration.find.restore()
        done()
      }, 90)
    })
  })
  */
  describe('.delete()', function () {
    it('should return error if event has registrations', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new group', registrations: [1, 2, 3], races: [] }
      var expected = 'Cannot delete group that has racers registered'

      this.timeout(150)
      sailsMock.mockModel(Group, 'findOne', mockData)
      sailsMock.mockModel(Race, 'count', 0)
      sailsMock.mockModel(Registration, 'count', 3)
      groupController.delete(req, res)
      setTimeout(function () {
        expect(actual.message).to.equal(expected)
        Group.findOne.restore()
        Race.count.restore()
        Registration.count.restore()
        done()
      }, 90)
    })
    it('should remove empty group', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new group', registrations: [], races: [] }
      var expected = { group: { id: 1 } }

      this.timeout(150)
      sailsMock.mockModel(Group, 'findOne', mockData)
      sailsMock.mockModel(Race, 'count', 0)
      sailsMock.mockModel(Registration, 'count', 0)
      sailsMock.mockModel(Group, 'destroy')

      groupController.delete(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Group.findOne.restore()
        Group.destroy.restore()
        Race.count.restore()
        Registration.count.restore()
        done()
      }, 90)
    })
    it('should throw error if group contains races', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new group', registrations: [], races: [ { id: 1 }, { id: 2 }, { id: 3 } ] }

      this.timeout(150)
      sailsMock.mockModel(Group, 'findOne', mockData)
      sailsMock.mockModel(Race, 'count', 3)
      sailsMock.mockModel(Registration, 'count', 0)
      groupController.delete(req, res)
      setTimeout(function () {
        expect(actual.message).to.deep.equal('Cannot delete group that contains races')
        Group.findOne.restore()
        Race.count.restore()
        Registration.count.restore()
        done()
      }, 90)
    })
    it('should remove group', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockData = { id: 1, name: 'new group', registrations: [], races: [] }
      var expected = { group: { id: 1 } }

      this.timeout(150)
      sailsMock.mockModel(Group, 'findOne', mockData)
      sailsMock.mockModel(Group, 'destroy')

      groupController.delete(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Group.findOne.restore()
        Group.destroy.restore()
        done()
      }, 90)
    })
  })
  describe('.update()', function () {
    it('should update specified fields', function (done) {
      var actual
      var req = { body: { id: 1, name: 'new group1' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = [{ id: 1, name: 'new group1' }]
      var expected = { group: mock[0] }

      this.timeout(99)
      sailsMock.mockModel(Group, 'update', mock)
      groupController.update(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Group.update.restore()
        done()
      }, 30)
    })
  })
})
