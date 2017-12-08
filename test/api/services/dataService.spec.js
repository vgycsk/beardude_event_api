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
      var actual = dataService.isValidReadTagInterval(entry.epc, entry.timestamp, recordsHashTable, intervalInMs)
      expect(actual).to.equal(true)
      done()
    })
    it('should return false if read interval is larger than specified value', function (done) {
      var entry = { epc: 'abc123', timestamp: 1507651200000 }
      var recordsHashTable = { 'abc123': [ 1507651000000, 1507651100000, 1507651199000 ], 'abc333': [ 1507651000000, 1507651199000, 1507651199900 ] }
      var intervalInMs = 10000 // 10 secs
      var actual = dataService.isValidReadTagInterval(entry.epc, entry.timestamp, recordsHashTable, intervalInMs)
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
  /*
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
  */
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
  describe('.updateRfidRecords()', function () {
    it('should return expected result from single record', function (done) {
      var expected = { recordsHashTable: { 'e00000000000000000000001': [1510164230] }, slaveEpcStat: {} }
      var actual
      var newRecordsToAdd = [{ epc: 'e00000000000000000000001', timestamp: 1510164230 }]
      var recordsHashTable = {}
      var slaveEpcStat = {}
      var slaveEpcMap = {}
      var validIntervalMs = 10000

      actual = dataService.updateRfidRecords(newRecordsToAdd, recordsHashTable, slaveEpcStat, slaveEpcMap, validIntervalMs)
      expect(actual).to.deep.equal(expected)
      done()
    })
    it('should return expected result from multiple records', function (done) {
      var expected = { recordsHashTable: { 'e00000000000000000000001': [1510164230], 'e00000000000000000000002': [1510164330], 'e00000000000000000000003': [1510164331] }, slaveEpcStat: {} }
      var actual
      var newRecordsToAdd = [{ epc: 'e00000000000000000000001', timestamp: 1510164230 }, { epc: 'e00000000000000000000001', timestamp: 1510164332 }, { epc: 'e00000000000000000000002', timestamp: 1510164330 }, { epc: 'e00000000000000000000003', timestamp: 1510164331 }]
      var recordsHashTable = {}
      var slaveEpcStat = {}
      var slaveEpcMap = {}
      var validIntervalMs = 10000

      actual = dataService.updateRfidRecords(newRecordsToAdd, recordsHashTable, slaveEpcStat, slaveEpcMap, validIntervalMs)
      expect(actual).to.deep.equal(expected)
      done()
    })
    it('should append new records to existing', function (done) {
      var expected = { recordsHashTable: { 'e00000000000000000000001': [1510064230, 1510164230], 'e00000000000000000000002': [1510064330, 1510164330], 'e00000000000000000000003': [1510164331] }, slaveEpcStat: {} }
      var actual
      var newRecordsToAdd = [{ epc: 'e00000000000000000000001', timestamp: 1510164230 }, { epc: 'e00000000000000000000001', timestamp: 1510164332 }, { epc: 'e00000000000000000000002', timestamp: 1510164330 }, { epc: 'e00000000000000000000003', timestamp: 1510164331 }]
      var recordsHashTable = { 'e00000000000000000000001': [1510064230], 'e00000000000000000000002': [1510064330] }
      var slaveEpcStat = {}
      var slaveEpcMap = {}
      var validIntervalMs = 10000

      actual = dataService.updateRfidRecords(newRecordsToAdd, recordsHashTable, slaveEpcStat, slaveEpcMap, validIntervalMs)
      expect(actual).to.deep.equal(expected)
      done()
    })
    it('should apply slave epcs and log it in stats', function (done) {
      var expected = { recordsHashTable: { 'e00000000000000000000001': [1510064230, 1510164230], 'e00000000000000000000002': [1510064330, 1510164330], 'e00000000000000000000003': [1510164331] }, slaveEpcStat: { 'e00000000000000000000001': [1] } }
      var actual
      var newRecordsToAdd = [{ epc: 'e0000000000000000000000a', timestamp: 1510164230 }, { epc: 'e00000000000000000000001', timestamp: 1510164332 }, { epc: 'e00000000000000000000002', timestamp: 1510164330 }, { epc: 'e00000000000000000000003', timestamp: 1510164331 }]
      var recordsHashTable = { 'e00000000000000000000001': [1510064230], 'e00000000000000000000002': [1510064330] }
      var slaveEpcStat = {}
      var slaveEpcMap = { 'e0000000000000000000000a': 'e00000000000000000000001' }
      var validIntervalMs = 10000

      actual = dataService.updateRfidRecords(newRecordsToAdd, recordsHashTable, slaveEpcStat, slaveEpcMap, validIntervalMs)
      expect(actual).to.deep.equal(expected)
      done()
    })
  })

  describe('returnLapRecord()', function (done) {
    const startTime = 1506492245000
    it('should return expected record', () => {
      const result = [1506492247000]
      expect(dataService.returnLapRecord(result, 5, startTime, 'started')).to.deep.equal(['🕒', '-', '-', '-', '-'])
    })
    it('should return expected record', () => {
      const result = [1506492247000]
      expect(dataService.returnLapRecord(result, 5, startTime, 'init')).to.deep.equal(['-', '-', '-', '-', '-'])
    })
    it('should return expected record', () => {
      const result = [1506492247000, 1506492267000]
      expect(dataService.returnLapRecord(result, 5, startTime, 'init')).to.deep.equal(['0:22.00', '-', '-', '-', '-'])
    })
    it('should return expected record', () => {
      const result = [1506492247000, 1506492267000, 1506492287000]
      expect(dataService.returnLapRecord(result, 5, startTime, 'init')).to.deep.equal(['0:22.00', '0:20.00', '-', '-', '-'])
    })
  })

  describe('returnAdvanceToId()', function () {
    it('should return advanced to race id', () => {
      expect(dataService.returnAdvanceToId(3, [{rankFrom: 0, rankTo: 5, toRace: 1}])).to.equal(1)
    })
    it('should return advanced to race id', () => {
      expect(dataService.returnAdvanceToId(5, [{rankFrom: 0, rankTo: 2, toRace: 1}, {rankFrom: 3, rankTo: 5, toRace: 2}])).to.equal(2)
    })
    it('should return undefined if rank not met', () => {
      expect(dataService.returnAdvanceToId(7, [{rankFrom: 0, rankTo: 2, toRace: 1}, {rankFrom: 3, rankTo: 5, toRace: 2}])).to.equal(undefined)
    })
  })

  describe('returnSortedResult()', function () {
    let race = { id: 'abc', registrationIds: [1, 2, 3], startTime: 1506492245000, laps: 4 }
    let regs = [
      { id: 1, epc: 'e00000000000000000000001', raceNumber: 1 },
      { id: 2, epc: 'e00000000000000000000002', raceNumber: 2 },
      { id: 3, epc: 'e00000000000000000000003', raceNumber: 3 }
    ]
    it('should return sorted race result', () => {
      race.recordsHashTable = {
        'e00000000000000000000001': [1506492247000, 1506492267000, 1506492287000, 1506492307000, 1506492337000],
        'e00000000000000000000002': [1506492248000, 1506492268000, 1506492288000, 1506492307000, 1506492325000],
        'e00000000000000000000003': [1506492249000, 1506492269000, 1506492289000, 1506492307000] }
      expect(dataService.returnSortedResult(race, regs)).to.deep.equal([
        { epc: regs[1].epc, registration: regs[1].id, raceNumber: regs[1].raceNumber, lastValidRecord: 1506492325000, lapsCompleted: 4, record: race.recordsHashTable[regs[1].epc] },
        { epc: regs[0].epc, registration: regs[0].id, raceNumber: regs[0].raceNumber, lastValidRecord: 1506492337000, lapsCompleted: 4, record: race.recordsHashTable[regs[0].epc] },
        { epc: regs[2].epc, registration: regs[2].id, raceNumber: regs[2].raceNumber, lastValidRecord: 1506492307000, lapsCompleted: 3, record: race.recordsHashTable[regs[2].epc] }
      ])
    })
    it('should return sorted race result', () => {
      race.recordsHashTable = {
        'e00000000000000000000001': [1506492247000, 1506492267000, 1506492287000],
        'e00000000000000000000002': [1506492248000, 1506492268000, 1506492288000],
        'e00000000000000000000003': [1506492249000, 1506492269000, 1506492289000] }
      expect(dataService.returnSortedResult(race, regs)).to.deep.equal([
        { epc: regs[0].epc, registration: regs[0].id, raceNumber: regs[0].raceNumber, lastValidRecord: 1506492287000, lapsCompleted: 2, record: race.recordsHashTable[regs[0].epc] },
        { epc: regs[1].epc, registration: regs[1].id, raceNumber: regs[1].raceNumber, lastValidRecord: 1506492288000, lapsCompleted: 2, record: race.recordsHashTable[regs[1].epc] },
        { epc: regs[2].epc, registration: regs[2].id, raceNumber: regs[2].raceNumber, lastValidRecord: 1506492289000, lapsCompleted: 2, record: race.recordsHashTable[regs[2].epc] }
      ])
    })
    it('should return sorted race result', () => {
      regs.push({ id: 4, epc: 'e00000000000000000000004', raceNumber: 4 })
      race.registrationIds.push(4)
      race.recordsHashTable = {
        'e00000000000000000000001': [1506492247000, 1506492267000, 1506492287000],
        'e00000000000000000000002': [1506492248000, 1506492268000],
        'e00000000000000000000003': [1506492249000, 1506492269000, 1506492289000] }
      expect(dataService.returnSortedResult(race, regs)).to.deep.equal([
        { epc: regs[0].epc, registration: regs[0].id, raceNumber: regs[0].raceNumber, lastValidRecord: 1506492287000, lapsCompleted: 2, record: race.recordsHashTable[regs[0].epc] },
        { epc: regs[2].epc, registration: regs[2].id, raceNumber: regs[2].raceNumber, lastValidRecord: 1506492289000, lapsCompleted: 2, record: race.recordsHashTable[regs[2].epc] },
        { epc: regs[1].epc, registration: regs[1].id, raceNumber: regs[1].raceNumber, lastValidRecord: 1506492268000, lapsCompleted: 1, record: race.recordsHashTable[regs[1].epc] },
        { epc: regs[3].epc, registration: regs[3].id, raceNumber: regs[3].raceNumber, lapsCompleted: 0, record: [] }
      ])
    })
    it('should return empty result if no matched regs in race', () => {
      regs.push({ id: 4, epc: 'e00000000000000000000004', raceNumber: 4 })
      race.registrationIds = [5]
      race.recordsHashTable = {
        'e00000000000000000000001': [1506492247000, 1506492267000, 1506492287000],
        'e00000000000000000000002': [1506492248000, 1506492268000],
        'e00000000000000000000003': [1506492249000, 1506492269000, 1506492289000] }
      expect(dataService.returnSortedResult(race, regs)).to.deep.equal([])
    })
  })
  describe('returnRaceResult()', function () {
    let race = { id: 'abc', registrationIds: [1, 2, 3], startTime: 1506492245000, laps: 4, result: [], recordsHashTable: {}, advancingRules: [] }
    let regs = [
      { id: 1, epc: 'e00000000000000000000001', raceNumber: 1 },
      { id: 2, epc: 'e00000000000000000000002', raceNumber: 2 },
      { id: 3, epc: 'e00000000000000000000003', raceNumber: 3 }
    ]
    it('should return expected race result 1', () => {
      const actual = dataService.returnRaceResult(race, regs)
      expect(actual.length).to.equal(3)
      expect(actual[0].epc).to.equal('e00000000000000000000001')
      expect(actual[0].sum).to.equal('-')
      expect(actual[0].lapRecords).to.deep.equal(['-', '-', '-', '-'])
      expect(actual[0].advanceTo).to.equal(undefined)
    })
    it('should return expected race result 2', () => {
      race.recordsHashTable = {
        'e00000000000000000000001': [1506492247000, 1506492267000, 1506492287000],
        'e00000000000000000000002': [1506492248000, 1506492268000, 1506492288000],
        'e00000000000000000000003': [1506492249000, 1506492269000, 1506492289000]
      }
      const actual = dataService.returnRaceResult(race, regs)
      expect(actual[0].sum).to.equal('0:42.00')
      expect(actual[1].sum).to.equal('0:43.00')
      expect(actual[2].sum).to.equal('0:44.00')
    })
    it('should return existing race result 3', () => {
      race.result = []
      const expected = [
        { epc: 'e00000000000000000000001', registration: 1, advanceTo: undefined, laps: 2, lapRecords: ['0:22.00', '0:20.00', '-', '-'], sum: '0:42.00' },
        { epc: 'e00000000000000000000002', registration: 2, advanceTo: undefined, laps: 2, lapRecords: ['0:23.00', '0:20.00', '-', '-'], sum: '0:43.00' },
        { epc: 'e00000000000000000000003', registration: 3, advanceTo: undefined, laps: 2, lapRecords: ['0:24.00', '0:20.00', '-', '-'], sum: '0:44.00' }
      ]
      const actual = dataService.returnRaceResult(race, regs)
      expect(actual).to.deep.equal(expected)
    })
  })
})
