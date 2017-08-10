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
  describe('.isValidRaceRecord()', function () {
    it('should return true if is pacer epc', function (done) {
      var epc = 'abc123'
      var raceData = { requirePacer: true, pacerEpc: 'abc123', raceStatus: 'started' }
      var actual = dataService.isValidRaceRecord(epc, raceData)
      expect(actual).to.equal(true)
      done()
    })
    it('should return false if race not started', function (done) {
      var epc = 'abc123'
      var raceData = { raceStatus: 'init' }
      var actual = dataService.isValidRaceRecord(epc, raceData)
      expect(actual).to.equal(false)
      done()
    })
    it('should return false if race started but countdown unfinished', function (done) {
      var epc = 'abc123'
      var raceData = { raceStatus: 'started', startTime: Date.now() + 6000 }
      var actual = dataService.isValidRaceRecord(epc, raceData)
      expect(actual).to.equal(false)
      done()
    })
    it('should return false if epc does not belong to regs in this race', function (done) {
      var epc = 'abc123'
      var raceData = { raceStatus: 'started', startTime: Date.now() - 6000, registrations: [ { id: 1, epc: 'aaa' }, { id: 1, epc: 'bbb' } ] }
      var actual = dataService.isValidRaceRecord(epc, raceData)
      expect(actual).to.equal(false)
      done()
    })
    it('should return true if valid', function (done) {
      var epc = 'abc123'
      var raceData = { raceStatus: 'started', startTime: Date.now() - 6000, registrations: [ { id: 1, epc: 'aaa' }, { id: 1, epc: 'abc123' } ] }
      var actual = dataService.isValidRaceRecord(epc, raceData)
      expect(actual).to.equal(true)
      done()
    })
  })
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
})
