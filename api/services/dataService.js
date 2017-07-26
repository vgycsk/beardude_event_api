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
  returnSortedResultFromHashTable: function (hashTable, regs) {
    var sortTable = []
    var result = []

    for (var i in hashTable) {
      if (hashTable.hasOwnProperty(i)) {
        sortTable.push([i], hashTable[i][hashTable[i].length - 1])
      }
    }
    sortTable.sort(function (a, b) { return a[1] - b[1] })
    result = sortTable.map(function (val) {
      var reg

      regs.map(function (V) {
        if (val[0] === V.epc) { reg = V.id }
      })
      return { registration: reg, epc: val[0], record: hashTable[val[0]] }
    })
    return result
  },
  returnMatchedRegsFromRule: function (rule, result) {
    var advanceObj = { id: rule.toRace, toAdd: [] }

    if (result.length > 0) {
      for (var i = rule.rankFrom; i <= rule.rankTo; i += 1) {
        advanceObj.toAdd.push(result[i].registration)
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
