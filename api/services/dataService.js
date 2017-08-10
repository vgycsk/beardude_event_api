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
  isValidReadTagInterval: function (entry, recordsHashTable, intervalInMs) {
    var records = recordsHashTable[entry.epc]
    var lastRecord = records[records.length - 1]
    if (records.length === 0) { return true }
    if (entry.timestamp - lastRecord > intervalInMs) { return true }
    return false
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
  // 1. lowercase 2. remove special char 3. condense
  sluggify: function (string) {
    return string.toLowerCase().replace(/[^\w\s]/gi, '').replace(/ +/g, '')
  }
}

module.exports = dataService
