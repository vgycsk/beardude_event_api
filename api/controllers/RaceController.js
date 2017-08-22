/* eslint-disable no-console */
/* global dataService, Event, Race, sails */

'use strict'

var updateFields = ['name', 'nameCht', 'laps', 'racerNumberAllowed', 'isEntryRace', 'isFinalRace', 'requirePacer', 'pacerEpc', 'advancingRules', 'registrationIds', 'result']
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
    input.map(function (race) {
      var updateObj = dataService.returnUpdateObj(updateFields, race)
      funcs.push(Race.update({ id: race.id }, updateObj))
    })
    Q.all(funcs)
    .then(function (output) {
      var races = output.map(function (data) { return data[0] })
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
  // {id: ID, toAdd: [ID, ID...], toRemove: [ID, ID...]}
  addRemoveRegs: function (raceObj) {
    var q = Q.defer()
    Race.findOne({id: raceObj.id})
    .then(function (raceData) {
      var modified
      var registrationIds = raceData.registrationIds
      if (raceObj.toRemove && raceObj.toRemove.length > 0) {
        modified = true
        raceObj.toRemove.map(function (regId) { registrationIds = dataService.removeFromArray(regId, registrationIds) })
      }
      if (raceObj.toAdd && raceObj.toAdd.length > 0) {
        modified = true
        raceObj.toAdd.map(function (regId) { registrationIds = dataService.addToArray(regId, registrationIds) })
      }
      if (!modified) { return false }
      return Race.update({ id: raceObj.id }, { registrationIds: registrationIds })
    })
    .then(function (V) { return q.resolve(V) })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  // inpit: { races: [{id: ID, toAdd: [ID, ID, ID], toRemove: ID, ID, ID}, {}, {}] }, output: { races: [] }
  assignRegsToRaces: function (req, res) {
    var input = req.body
    var funcs = []

    input.races.map(function (race) { funcs.push(RaceController.addRemoveRegs(race)) })
    Q.all(funcs)
    .then(function (V) {
      var races = []
      V.map(function (raceData) { races.push(raceData[0]) })
      return res.ok({ races: races })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, startTime: TIMESTAMP}, output: { races: [] }
  startRace: function (req, res) {
    var input = req.body
    var raceObj
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      return Event.findOne({ id: raceData.event })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace && eventData.ongoingRace !== -1) { throw new Error('Another race ongoing') }
      return Race.update({ id: input.id }, { startTime: (input.startTime) ? input.startTime : Date.now(), raceStatus: 'started' })
    })
    .then(function (raceData) {
      raceObj = raceData
      return Event.update({ id: raceObj.event }, { ongoingRace: input.id })
    })
    .then(function () {
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceObj })
      return res.ok({ races: raceObj })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID }, output: { races: [] }
  resetRace: function (req, res) {
    var raceObj
    Race.update({ id: req.body.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {}, result: [] })
    .then(function (raceData) {
      raceObj = raceData
      return Event.update({ id: raceObj.event }, { ongoingRace: -1 })
    })
    .then(function () {
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceObj })
      return res.ok({ races: raceObj })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, endTime: TIMESTAMP}, output: { races: [] }
  endRace: function (req, res) {
    var input = req.body
    var raceObj
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'started') { throw new Error('Can only stop a started race') }
      return Race.update({ id: input.id }, { endTime: (input.endTime) ? input.endTime : Date.now(), raceStatus: 'ended' })
    })
    .then(function (raceData) {
      raceObj = raceData
      return Event.update({ id: raceObj.event }, { ongoingRace: -1 })
    })
    .then(function () {
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceObj })
      return res.ok({ races: raceObj })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID, result: [], advance: []}, output: { races: [] }
  submitResult: function (req, res) {
    var input = req.body
    var races = []
    Race.update({id: input.id}, { result: input.result, raceStatus: 'submitted', submitTime: Date.now() })
    .then(function (raceData) {
      var funcs = []
      races.push(raceData[0])
      input.advance.map(function (obj) { funcs.push(RaceController.addRemoveRegs(obj)) })
      return Q.all(funcs)
    })
    .then(function (V) {
      V.map(function (raceData) { races.push(raceData[0]) })
      sails.sockets.broadcast('rxdata', 'raceresult', { races: races })
      return res.ok({ races: races })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // get: 加入socket.io, post: 控制至尊機, rxdata: 至尊機發送讀卡資料, readerCtrl: 至尊機接收控制及發送狀態
  // input: { type: STR, payload: {} }
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
          if (data) { sails.sockets.broadcast('rxdata', 'raceupdate', data) }
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
    Event.findOne({id: eventId})
    .then(function (eventData) {
      if (!eventData) { return false }
      return Event.update({ id: eventId }, { rawRfidData: eventData.rawRfidData.concat(entries) })
    })
    .then(function (eventData) {
      if (!eventData || eventData.length === 0 || eventData[0].ongoingRace === -1) { return false }
      return RaceController.insertRfidToRace(eventData[0].ongoingRace, entries)
    })
    .then(function (result) { return q.resolve(result) })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  insertRfidToRace: function (raceId, entries) {
    var validRecordInterval = 10000 // 10secs
    var q = Q.defer()
    Race.findOne({id: raceId})
    .then(function (raceData) {
      if (!raceData) { return false }
      if (raceData.raceStatus !== 'started' || Date.now() < raceData.startTime) { return false }

      var recordsHashTable = raceData.recordsHashTable
      var hasEntry
      entries.map(function (entry) {
        if (!recordsHashTable[entry.epc]) {
          recordsHashTable[entry.epc] = [ entry.timestamp ]
          hasEntry = true
        } else if (dataService.isValidReadTagInterval(entry, recordsHashTable, validRecordInterval)) {
          recordsHashTable[entry.epc].push(entry.timestamp)
          hasEntry = true
        }
      })
      if (!hasEntry) { return false }
      return Race.update({id: raceId}, {recordsHashTable: recordsHashTable})
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
