/* eslint-disable no-param-reassign */
/* global Registration */

'use strict'

var bcrypt = require('bcrypt-nodejs')
var randomstring = require('randomstring')
var Q = require('q')
var dataService = {
  addToArray: function (itemToAdd, array) {
    var found
    var newArray = array
    array.map(function (V, I) {
      if (V === itemToAdd) { found = true }
    })
    if (!found) { newArray.push(itemToAdd) }
    return newArray
  },
  removeFromArray: function (itemToRemove, array) {
    array.map(function (V, I) {
      if (V === itemToRemove) { array.splice(I, 1) }
    })
    return array
  },
  authenticate: function (inputPassword, userDataPassword) {
    var q = Q.defer()

    bcrypt.compare(inputPassword, userDataPassword, function (err, compareResult) {
      if (err) { return q.reject('bcrypt compare error') }
      if (!compareResult) { return q.resolve(false) }
      return q.resolve(true)
    })
    return q.promise
  },
  returnUpdateObj: function (fields, input) {
    var updateObj = {}

    fields.forEach(function (field) {
      if (typeof input[field] !== 'undefined') { updateObj[field] = input[field] }
    })
    return updateObj
  },
  returnUpdatedRaceNotes: function (raceId, raceNote, existingRaceNotes) {
    var raceNotes = existingRaceNotes
    var dataExist
    var i

    for (i = 0; i < existingRaceNotes.length; i += 1) {
      if (raceNotes[i].race === raceId) {
        raceNotes[i].note = raceNote
        dataExist = true
        break
      }
    }
    if (!dataExist) { raceNotes.push({ race: raceId, note: raceNote }) }
    return raceNotes
  },
  isValidReadTagInterval: function (epc, timestamp, recordsHashTable, intervalInMs) {
    var records = recordsHashTable[epc]
    var lastRecord
    if (records.length === 0) { return true }
    lastRecord = records[records.length - 1]
    if (timestamp - lastRecord > intervalInMs) { return true }
    return false
  },
  returnAccessCode: function (eventId) {
    var q = Q.defer()
    var codeLength = 4
    var code = randomstring.generate({ length: codeLength })
    var getCode = function (code) {
      Registration.findOne({ event: eventId, accessCode: code })
      .then(function (modelData) {
        if (modelData) {
          code = randomstring.generate({ length: codeLength })
          return getCode(code)
        }
        return q.resolve(code)
      })
    }

    getCode(code)
    return q.promise
  },
  returnRacesByOrder: function (races, order) {
    let result = []
    order.map(raceId => { races.map(race => { if (race.id === raceId) { result.push(race) } }) })
    return result
  },
  // 1. lowercase 2. remove special char 3. condense
  sluggify: function (string) {
    return string.toLowerCase().replace(/[^\w\s]/gi, '').replace(/ +/g, '')
  },
  // raceObj: { event: ID, (pacerEpcSlave: STR, pacerEpc: STR) }
  returnSlaveEpcMap: function (raceObj) {
    var q = Q.defer()
    var result = {}
    if (raceObj.pacerEpcSlave) { result[raceObj.pacerEpcSlave] = raceObj.pacerEpc }
    Registration.find({ event: raceObj.event })
    .then(function (regData) {
      regData.map(function (reg) { if (reg.epcSlave) { result[reg.epcSlave] = reg.epc } })
      return q.resolve(result)
    })
    return q.promise
  },
  // Validate new records' interval, determine if slaveEpc, then append into existing recordHashTable
  updateRfidRecords: function (newRecordsToAdd, recordsHashTable, slaveEpcStat, slaveEpcMap, validIntervalMs) {
    var result = { recordsHashTable: recordsHashTable, slaveEpcStat: slaveEpcStat }
    newRecordsToAdd.map(function (record) {
      var epc = record.epc
      var isSlave
      if (typeof slaveEpcMap[record.epc] !== 'undefined') {
        epc = slaveEpcMap[record.epc]
        isSlave = true
      }
      if (!result.recordsHashTable[epc]) { result.recordsHashTable[epc] = [] } // 還沒資料的話, 新增一個空的array
      if (dataService.isValidReadTagInterval(epc, record.timestamp, result.recordsHashTable, validIntervalMs)) {
        result.recordsHashTable[epc].push(record.timestamp)
        if (isSlave) {  // Save slave epc read stat, for debugging
          if (typeof result.slaveEpcStat[epc] === 'undefined') { result.slaveEpcStat[epc] = [] }
          result.slaveEpcStat[epc].push(result.recordsHashTable[epc].length - 1)
        }
      }
    })
    return result
  }
}

module.exports = dataService
