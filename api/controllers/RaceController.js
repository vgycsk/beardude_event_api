/* eslint-disable no-console */
/* global dataService, Event, Race, sails */

'use strict'

var updateFields = ['name', 'nameCht', 'laps', 'racerNumberAllowed', 'isEntryRace', 'isFinalRace', 'requirePacer', 'pacerEpc', 'pacerEpcSlave', 'advancingRules', 'registrationIds', 'raceStatus', 'result']
var Q = require('q')
var RaceController = {
  // input: {group: ID, event: ID, name: STR, nameCht: STR, laps: INT, racerNumberAllowed: INT, requirePacer: BOOL}, output: { races: [] }
  create: function (req, res) {
    var result
    Race.create(req.body)
    .then(function (V) {
      result = V
      return Event.findOne({id: V.event})
    })
    .then(function (V) {
      if (!V) { throw new Error('event not found: ' + V.event) }
      var raceOrder = V.raceOrder
      raceOrder.push(result.id)
      return Event.update({ id: V.id }, { raceOrder: raceOrder })
    })
    .then(function () { return res.ok({ races: [result] }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {}, output: { races: [] }
  update: function (req, res) {
    var input = req.body
    var updateObj = dataService.returnUpdateObj(updateFields, input)
    Race.update({ id: input.id }, updateObj)
    .then(function (raceData) { return res.ok({ races: raceData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: [{ id: ID, OBJ }], output: { races: []}
  updateMulti: function (req, res) {
    var input = req.body
    var funcs = []
    var toBroadcast = (input[0].raceStatus && input[0].raceStatus === 'submitted')
    input.map(function (race) {
      var updateObj = dataService.returnUpdateObj(updateFields, race)
      funcs.push(Race.update({ id: race.id }, updateObj))
    })
    Q.all(funcs)
    .then(function (output) {
      var races = output.map(function (data) { return data[0] })
      if (toBroadcast) { sails.sockets.broadcast('rxdata', 'raceend', { races: races }) }
      return res.ok({ races: races })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: /:id output: { race: { id: ID } }
  delete: function (req, res) {
    var query = { id: req.params.id }
    var eventId
    Race.findOne(query)
    .then(function (V) {
      if (V.startTime && V.startTime !== '') { throw new Error('Cannot delete a started race') }
      eventId = V.event
      return Race.destroy(query)
    })
    .then(function () {
      return Event.findOne({ id: eventId })
    })
    .then(function (V) {
      var raceOrder = V.raceOrder
      raceOrder.map(function (item, index) { if (item === query.id) { raceOrder.splice(index, 1) } })
      return Event.update({ id: eventId }, { raceOrder: raceOrder })
    })
    .then(function () { return res.ok({ race: query }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: EVENT_ID, action: 'start' || 'end' || 'reset'}
  testRfid: function (req, res) {
    var input = req.body
    var query = { id: input.id }
    var updateObj = { ongoingRace: '' }
    return Event.findOne(query)
    .then(function (eventData) {
      if (input.action === 'start') {
        if (eventData.ongoingRace !== '') { throw new Error('Another race ongoing') }
        updateObj = { ongoingRace: 'testRfid', testRfidHashTable: {}, slaveEpcStat: {} }
        return dataService.returnSlaveEpcMap({ event: eventData.id })
      }
      if (input.action === 'reset') {
        if (eventData.ongoingRace === 'testRfid') { updateObj = {} }
        updateObj.testRfidHashTable = {}
        updateObj.slaveEpcStat = {}
      }
      if (input.action === 'end' && eventData.ongoingRace !== 'testRfid') { throw new Error('Not in test Rfid mode') }
      return false
    })
    .then(function (slaveEpcMapData) {
      if (slaveEpcMapData) { updateObj.slaveEpcMap = slaveEpcMapData }
      return Event.update(query, updateObj)
    })
    .then(function (eventData) { return res.ok({ event: eventData[0] }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, startTime: TIMESTAMP}, output: { races: [] }
  startRace: function (req, res) {
    var input = req.body
    var eventId
    var slaveEpcMap
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      eventId = raceData.event
      return dataService.returnSlaveEpcMap(raceData)
    })
    .then(function (slaveEpcMapData) {
      slaveEpcMap = slaveEpcMapData
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace !== '') { throw new Error('Another race ongoing') }
      return Event.update({ id: eventData.id }, { ongoingRace: input.id })
    })
    .then(function () {
      return Race.update({ id: input.id }, { startTime: (input.startTime) ? input.startTime : Date.now(), raceStatus: 'started', slaveEpcMap: slaveEpcMap })
    })
    .then(function (raceData) {
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData })
      return res.ok({ races: raceData })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID }, output: { races: [] }
  resetRace: function (req, res) {
    var output
    Race.update({ id: req.body.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {}, result: [] })
    .then(function (raceData) {
      output = raceData
      return Event.update({ id: output[0].event }, { ongoingRace: '' })
    })
    .then(function () {
      sails.sockets.broadcast('rxdata', 'raceend', { races: output })
      return res.ok({ races: output })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, endTime: TIMESTAMP}, output: { races: [] }
  endRace: function (req, res) {
    var input = req.body
    var output
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'started') { throw new Error('Can only stop a started race') }
      return Race.update({ id: input.id }, { endTime: (input.endTime) ? input.endTime : Date.now(), raceStatus: 'ended' })
    })
    .then(function (raceData) {
      output = raceData
      return Event.update({ id: output[0].event }, { ongoingRace: '' })
    })
    .then(function () {
      sails.sockets.broadcast('rxdata', 'raceend', { races: output })
      return res.ok({ races: output })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // get: 加入socket.io, post: 控制至尊機, rxdata: 至尊機發送讀卡資料, readerCtrl: 至尊機接收控制及發送狀態
  // input: { type: STR, payload: { eventId: ID } }
  socketManagement: function (req, res) {
    var input = req.body
    if (input) {
      if (input.type === 'startreader') {
        sails.sockets.broadcast('readerCtrl', input.type, input.payload)
        return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
      }
      sails.sockets.broadcast('readerCtrl', input.type, { result: input.payload })
      return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
    }
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    return res.json({ result: 'join socket_channel_OK' })
  },
  // get: 加入socket.io, post: 發送讀卡資料
  // input: { type: STR, payload: {} }
  socketImpinj: function (req, res) {
    var input = req.body
    if (input) {
      if (input.type === 'rxdata' && input.event) {
        return RaceController.insertRfid(input.event, input.payload)
        .then(function (data) {
          if (data) {
            if (data.races) { sails.sockets.broadcast('rxdata', 'raceupdate', data) }
            if (data.event) { sails.sockets.broadcast('rxdata', 'testrfid', data) }
          }
          return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
        })
        .catch(function (E) { return res.badRequest(E) })
      }
      sails.sockets.broadcast('readerCtrl', input.type, { result: input.payload })
      return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
    }
    // rxdata: 至尊機發送讀卡資料, readerCtrl: 至尊機接收控制及發送狀態
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    return res.json({ result: 'join socket_channel_OK' })
  },
  // Public event, 只加入rxdata接收戰況更新
  socket: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    return res.json({ result: 'join socket_channel_OK' })
  },
  insertRfid: function (eventId, entriesRaw) {
    var q = Q.defer()
    var entries = entriesRaw.map(function (entry) { return { epc: entry.epc, timestamp: parseInt(entry.timestamp) } })
    var isTest
    var validIntervalMs = 1000 // 1s
    Event.findOne({id: eventId})
    .then(function (eventData) {
      if (!eventData) { return false }
      if (eventData.ongoingRace === 'testRfid') {
        var updateObj = RaceController.returnRfidUpdateObj(entries, eventData.testRfidHashTable, eventData.slaveEpcMap, eventData.slaveEpcStat, validIntervalMs)
        isTest = true
        if (!updateObj.hasEntry) { return false }
        return Event.update({ id: eventId }, { testRfidHashTable: updateObj.recordsHashTable, slaveEpcStat: updateObj.slaveEpcStat })
      }
      return Event.update({ id: eventId }, { rawRfidData: eventData.rawRfidData.concat(entries) })
    })
    .then(function (eventData) {
      if (!eventData || eventData.length === 0 || eventData[0].ongoingRace === '') { return false }
      if (isTest) { return { event: eventData[0] } }
      return RaceController.insertRfidToRace(eventData[0].ongoingRace, entries, eventData[0].validIntervalMs)
    })
    .then(function (result) { return q.resolve(result) })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  returnRfidUpdateObj: function (entries, recordsHashTable, slaveEpcMap, slaveEpcStat, validIntervalMs) {
    var result = { recordsHashTable: recordsHashTable, slaveEpcStat: slaveEpcStat, hasEntry: false }
    entries.map(function (entry) {
      var epc = entry.epc
      var isSlave
      if (typeof slaveEpcMap[epc] !== 'undefined') {
        epc = slaveEpcMap[epc]
        isSlave = true
      }
      if (!result.recordsHashTable[epc]) { result.recordsHashTable[epc] = [] }
      if (dataService.isValidReadTagInterval(epc, entry.timestamp, recordsHashTable, validIntervalMs)) {
        result.recordsHashTable[epc].push(entry.timestamp)
        result.hasEntry = true
      }
      // Save slave epc read stat, for debugging
      if (isSlave && result.hasEntry) {
        if (typeof result.slaveEpcStat[epc] === 'undefined') { result.slaveEpcStat[epc] = {} }
        result.slaveEpcStat[epc][(result.recordsHashTable[epc].length - 1).toString()] = 1
      }
    })
    return result
  },
  insertRfidToRace: function (raceId, entries, validIntervalMs) {
    var q = Q.defer()
    Race.findOne({id: raceId})
    .then(function (raceData) {
      if (!raceData) { return false }
      if (raceData.raceStatus !== 'started' || Date.now() < raceData.startTime) { return false }
      var updateObj = RaceController.returnRfidUpdateObj(entries, raceData.recordsHashTable, raceData.slaveEpcMap, raceData.slaveEpcStat, validIntervalMs)
      if (!updateObj.hasEntry) { return false }
      return Race.update({id: raceId}, {recordsHashTable: updateObj.recordsHashTable, slaveEpcStat: updateObj.slaveEpcStat})
    })
    .then(function (raceData) {
      if (!raceData) { return q.resolve(false) }
      return q.resolve({ races: raceData })
    })
    .catch(function (E) {
      console.log('insertRfidToRace e: ', E)
      return q.reject(E)
    })
    return q.promise
  }
}
module.exports = RaceController
