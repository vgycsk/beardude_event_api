/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Registration */

var dataService = require('../../../api/services/dataService.js')
var assert = require('assert')
var bcrypt = require('bcrypt-nodejs')
var sinon = require('sinon')
var chai = require('chai')
var expect = chai.expect
var sailsMock = require('sails-mock-models')
var Q = require('q')

describe('services/dataService', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })

  describe('authenticate()', function () {
    it('should return true if password matches', function (done) {
      var password = '123abcde'

      return bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          assert.equal(false, true)
          return done()
        }
        return dataService.authenticate(password, hash)
                .then(function (result) {
                  assert.equal(result, true)
                  return done()
                })
      })
    })
    it('should return false if passwords do not match', function (done) {
      var password = '123abcde'
      var enteredPassword = '123Abcde'

      return bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          assert.equal(true, false)
          return done()
        }
        return dataService.authenticate(enteredPassword, hash)
                .then(function (result) {
                  assert.equal(result, false)
                  return done()
                })
      })
    })
  })
  describe('.returnUpdateObj()', function () {
    it('should return an object for update', function (done) {
      var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isPublic']
      var input = {
        name: 'newName',
        nameCht: '不變',
        lapDistance: 10,
        location: 'new location',
        isPublic: false
      }
      var actual = dataService.returnUpdateObj(fields, input)

      assert.deepEqual(actual, input)
      done()
    })
    it('should return empty object if nothing to update', function (done) {
      var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isPublic']
      var input = { isCool: false }
      var actual = dataService.returnUpdateObj(fields, input)

      assert.deepEqual(actual, {})
      done()
    })
  })
  describe('.isValidReadTagInterval()', function () {
    it('should return true if read interval is larger than specified value', function (done) {
      var entry = { epc: 'abc123', timestamp: 1507651200000 }
      var recordsHashTable = { 'abc123': [ 1507651000000, 1507651100000 ], 'abc333': [ 1507651000000, 1507651199000, 1507651199900 ] }
      var intervalInMs = 10000 // 10 secs
      var actual = dataService.isValidReadTagInterval(entry, recordsHashTable, intervalInMs)
      expect(actual).to.equal(true)
      done()
    })
    it('should return false if read interval is larger than specified value', function (done) {
      var entry = { epc: 'abc123', timestamp: 1507651200000 }
      var recordsHashTable = { 'abc123': [ 1507651000000, 1507651100000, 1507651199000 ], 'abc333': [ 1507651000000, 1507651199000, 1507651199900 ] }
      var intervalInMs = 10000 // 10 secs
      var actual = dataService.isValidReadTagInterval(entry, recordsHashTable, intervalInMs)
      expect(actual).to.equal(false)
      done()
    })
  })
/*
  isValidReadTagInterval: function (entry, recordsHashTable, intervalInMs) {
    var records = recordsHashTable[entry.epc]
    var lastRecord = records[records.length - 1]
    if (records.length === 0) { return true }
    if (entry.timestamp - lastRecord > intervalInMs) { return true }
    return false
  },
*/
  describe('.returnUpdatedRaceNotes()', function () {
    it('should append new race note to existing raceNotes array', function (done) {
      var raceId = 7
      var raceNote = '摔車'
      var existingRaceNotes = [{
        race: 2,
        note: '疑似晶片脫落'
      }]
      var actual = dataService.returnUpdatedRaceNotes(raceId, raceNote, existingRaceNotes)
      var expected = [
        {
          race: 2,
          note: '疑似晶片脫落'
        },
        {
          race: 7,
          note: '摔車'
        }
      ]

      assert.deepEqual(actual, expected)
      done()
    })

    it('should replace existing race note', function (done) {
      var raceId = 2
      var raceNote = '疑似摔車造成晶片脫落'
      var existingRaceNotes = [{
        race: 2,
        note: '疑似晶片脫落'
      }]
      var actual = dataService.returnUpdatedRaceNotes(raceId, raceNote, existingRaceNotes)
      var expected = [{
        race: 2,
        note: '疑似摔車造成晶片脫落'
      }]

      assert.deepEqual(actual, expected)
      done()
    })
  })
  describe('.returnAccessCode()', function () {
    it('should return 4-letter unique access code within an event', function (done) {
      var actual

      sandbox.stub(Q, 'defer').callsFake(function () {
        return {
          resolve: function (obj) { actual = obj },
          reject: function (obj) { actual = obj }
        }
      })
      sailsMock.mockModel(Registration, 'findOne')
      actual = dataService.returnAccessCode(1)
      this.timeout(200)
      setTimeout(function () {
        expect(actual.length).to.equal(4)
        Registration.findOne.restore()
        done()
      }, 150)
    })
  })
  describe('.returnRacesByOrder()', function () {
    it('should return races by order', function (done) {
      var actual
      var races = [{id: '11111'}, {id: '22222'}, {id: '33333'}, {id: '44444'}, {id: '55555'}]
      var raceOrder = ['33333', '22222', '55555', '11111', '44444']
      var expected = [{id: '33333'}, {id: '22222'}, {id: '55555'}, {id: '11111'}, {id: '44444'}]

      actual = dataService.returnRacesByOrder(races, raceOrder)
      expect(actual).to.deep.equal(expected)
      done()
    })
    it('should not equal result of different order', function (done) {
      var actual
      var races = [{id: '11111'}, {id: '22222'}, {id: '33333'}, {id: '44444'}, {id: '55555'}]
      var raceOrder = ['33333', '22222', '55555', '11111', '44444']
      var expected = [{id: '11111'}, {id: '22222'}, {id: '33333'}, {id: '44444'}, {id: '55555'}]

      actual = dataService.returnRacesByOrder(races, raceOrder)
      expect(actual).to.not.deep.equal(expected)
      done()
    })
  })
})
