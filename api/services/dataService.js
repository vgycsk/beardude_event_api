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
  /*
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
  */
  // Validate if tag entry meets interval requirement
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
      Registration.count({ event: eventId, accessCode: code })
      .then(function (regLen) {
        if (regLen > 0) {
          code = randomstring.generate({ length: codeLength })
          return getCode(code)
        }
        return q.resolve(code)
      })
    }

    getCode(code)
    return q.promise
  },
  // 把timestamp parse成日期時間
  returnFormattedTime: function (milS) {
    const sec = ((milS % 60000) / 1000).toFixed(2)
    const min = Math.floor(milS / 60000)
    return min + ':' + (sec < 10 ? '0' : '') + sec
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
  // 回傳可晉級的比賽ID
  returnAdvanceToId: function (rank, advancingRules) {
    for (var i = 0; i < advancingRules.length; i += 1) {
      if (rank >= advancingRules[i].rankFrom && rank <= advancingRules[i].rankTo) { return advancingRules[i].toRace }
    }
    return undefined
  },
  // 讀取並回傳所有單圈成績
  // 完成圈數顯示單圈成績, 進行中顯示時鐘emoji, 沒成績顯示-
  returnLapRecord: function (result, laps, startTime, raceStatus) {
    let output = []
    let lastRecord = startTime
    let lapsLeft = laps
    let i

    if (result.length > 0) {
      for (i = 1; i <= result.length; i += 1) {
        if (result[i]) {
          output.push(dataService.returnFormattedTime(result[i] - lastRecord))
          lastRecord = result[i]
          lapsLeft -= 1
        } else if (lapsLeft > 0 && raceStatus === 'started') {
          output.push('🕒')
          lapsLeft -= 1
        }
      }
    }
    for (i = 0; i < lapsLeft; i += 1) { output.push('-') }
    return output
  },
  assignRaceNumber: function (eventId) {
    var q = Q.defer()
    var raceNumber
    var getDefaultNumber = function (raceNumber) {
      var qq = Q.defer()
      Registration.count({ event: eventId, raceNumber: raceNumber })
      .then(function (regLen) {
        if (regLen > 0) {
          return getDefaultNumber(raceNumber += 1)
        }
        return qq.resolve(raceNumber)
      })
      return qq.promise
    }
    Registration.count({ event: eventId })
    .then(function (regLen) {
      raceNumber = regLen + 1
      return getDefaultNumber(raceNumber)
    })
    .then(function (raceNumber) {
      return q.resolve(raceNumber)
    })
    return q.promise
  },
  requestRaceNumber: function (eventId, desiredNumber, originalNumber) {
    var q = Q.defer()

    Registration.count({ event: eventId, raceNumber: desiredNumber })
    .then(function (regLen) {
      if (regLen === 0) {
        return desiredNumber
      } else if (originalNumber) {
        return originalNumber
      }
      return dataService.assignRaceNumber(eventId)
    })
    .then(function (raceNumber) {
      return q.resolve(raceNumber)
    })
    return q.promise
  },
  returnSortedResult: function (race, regs) {
    let sortTable = []
    let incomplete = []
    let notStarted = []
    const lastRecordIndex = race.laps

    race.registrationIds.map(regId => {
      const reg = regs.filter(V => (V.id === regId))[0]
      if (reg) {
        const record = race.recordsHashTable[reg.epc]
        let obj = { epc: reg.epc, registration: reg.id, raceNumber: reg.raceNumber, lapsCompleted: 0, record: [] }
        if (record) { // has epc record
          obj.lapsCompleted = record.length - 1
          obj.record = record
          if (record[lastRecordIndex]) { // 1. completed race
            obj.lastValidRecord = record[lastRecordIndex]
            sortTable.push(obj)
          } else { // 2. not complete
            obj.lastValidRecord = record[record.length - 1]
            incomplete.push(obj)
          }
        } else { // 3. no epc record
          notStarted.push(obj)
        }
      }
    })
    sortTable.sort((a, b) => a.lastValidRecord - b.lastValidRecord) // sort completed racer by last lap record
    incomplete.sort((a, b) => b.lapsCompleted - a.lapsCompleted) // sort incompleted by laps
    incomplete.sort((a, b) => (a.lapsCompleted === b.lapsCompleted) ? a.lastValidRecord - b.lastValidRecord : 0) // sort incompleted same-lap by time
    notStarted.sort((a, b) => a.raceNumber - b.raceNumber) // sort notStart by raceNumber
    sortTable = sortTable.concat(incomplete).concat(notStarted)
    // output: { epc, id, raceNumber, lastValidRecord, lapsCompleted, record }
    return sortTable
  },
  // 將 race.recordsHashTable parse成race.result. 並依成績做排序
  returnRaceResult: function (race, regs) {
    const sortTable = dataService.returnSortedResult(race, regs)
    return sortTable.map((item, index) => ({
      epc: item.epc,
      registration: item.registration,
      sum: (item.lastValidRecord) ? dataService.returnFormattedTime(item.lastValidRecord - race.startTime) : '-',
      laps: item.lapsCompleted,
      lapRecords: dataService.returnLapRecord(item.record, race.laps, race.startTime, race.raceStatus),
      advanceTo: dataService.returnAdvanceToId(index, race.advancingRules)
    }))
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
      // 1. check if this is a slave tag
      if (typeof slaveEpcMap[record.epc] !== 'undefined') {
        epc = slaveEpcMap[record.epc]
        isSlave = true
      }
      // 2. Initialize record if not yet available
      if (!result.recordsHashTable[epc]) { result.recordsHashTable[epc] = [] }
      // 3. Validate interval
      if (dataService.isValidReadTagInterval(epc, record.timestamp, result.recordsHashTable, validIntervalMs)) {
        result.recordsHashTable[epc].push(record.timestamp)
        // 4. If slave tag, save read index to slave stats
        if (isSlave) {
          if (typeof result.slaveEpcStat[epc] === 'undefined') { result.slaveEpcStat[epc] = [] }
          result.slaveEpcStat[epc].push(result.recordsHashTable[epc].length - 1)
        }
      }
    })
    return result
  }
}

module.exports = dataService
