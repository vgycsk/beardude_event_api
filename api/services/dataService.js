/* eslint-disable no-param-reassign */
/* global Registration */

'use strict'

var bcrypt = require('bcrypt-nodejs')
var randomstring = require('randomstring')
var Q = require('q')
var dataService = {
  authenticate: function (inputPassword, userDataPassword) {
    var q = Q.defer()

    bcrypt.compare(inputPassword, userDataPassword, function (err, compareResult) {
      if (err) { return q.reject('bcrypt compare error') }
      if (!compareResult) { return q.resolve(false) }
      return q.resolve(true)
    })
    return q.promise
  },
  returnUpdateObj: function (fields, input, originalData) {
    var updateObj = {}
    var toUpdate

    if (originalData) {
      fields.forEach(function (field) {
        if (typeof input[field] !== 'undefined' && (originalData[field] !== input[field])) {
          updateObj[field] = input[field]
          toUpdate = true
        }
      })
      if (toUpdate) { return updateObj }
    } else {
      fields.forEach(function (field) {
        if (typeof input[field] !== 'undefined') { updateObj[field] = input[field] }
      })
      return updateObj
    }
    return {}
  },
  sluggify: function (string) {
    return string
        .trim()
        .toLowerCase()
        // condense
        .replace(/ +/g, '-')
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
  isValidRaceRecord: function (epc, raceData) {
    var validateRaceStarted = function (raceData) {
      if (raceData.raceStatus === 'started' && Date.now() >= raceData.startTime) { return true }
      return false
    }
    var validateRegInRace = function (epc, regs) {
      for (var i = 0; i < regs.length; i += 1) { if (regs[i].epc === epc) { return true } }
      return false
    }
    if (raceData.requirePacer && epc === raceData.pacerEpc) { return true }
    if (validateRaceStarted(raceData) && validateRegInRace(epc, raceData.registrations)) { return true }
    return false
  },
  returnSortedResultFromHashTable: function (hashTable, regs, laps) {
    var sortTable = []
    var result = []
    var inCompleteBucket = []
    var lastRecordIndex = laps + 1

    for (var i in hashTable) {
      if (hashTable.hasOwnProperty(i)) {
        if (hashTable[i][lastRecordIndex]) {
          // completed:  [epc, timestamp]
          sortTable.push([i, hashTable[i][lastRecordIndex]])
        } else {
          // incomplete: [epc, timestamp, laps]
          inCompleteBucket.push([i, hashTable[i][hashTable[i].length - 1], hashTable[i].length])
        }
      }
    }
    // sort completed by record
    sortTable.sort(function (a, b) { return a[1] - b[1] })

    // sort incomplete by laps completed
    inCompleteBucket.sort(function (a, b) { return b[2] - a[2] })

    // sort incomplete of same laps by time
    inCompleteBucket.sort(function (a, b) { return (a[2] === b[2]) ? a[1] - b[1] : 0 })
    sortTable = sortTable.concat(inCompleteBucket)
    result = sortTable.map(function (record) {
      for (var i = 0; i < regs.length; i += 1) {
        if (regs[i].epc === record[0]) {
          return { registration: regs[i].id, epc: regs[i].epc, record: hashTable[regs[i].epc] }
        }
      }
    })
    return result
  },
  returnMatchedRegsFromRule: function (rule, result) {
    var advanceObj = { id: rule.toRace, toAdd: [] }

    if (result.length > 0) {
      for (var i = rule.rankFrom; i <= rule.rankTo; i += 1) {
        if (result[i] && result[i].registration) { advanceObj.toAdd.push(result[i].registration) }
      }
    }
    return advanceObj
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
  }
}

module.exports = dataService
