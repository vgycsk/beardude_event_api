/* eslint-disable no-console */
/* global dataService, Event, Race, sails */

'use strict'

var Q = require('q')
var RaceController = {
  // {group: ID, event: ID, name: STR, nameCht: STR, laps: INT, racerNumberAllowed: INT, requirePacer: BOOL}
  create: function (req, res) {
    var result
    Race.create(req.body)
    .then(function (V) {
      result = V
      return Event.findOne({id: V.event})
    })
    .then(function (V) {
      var raceOrder
      if (V) { raceOrder = V.raceOrder }
      raceOrder.push(result.id)
      return Event.update({ id: V.id }, { raceOrder: raceOrder })
    })
    .then(function () { return res.ok({ race: result }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  getInfo: function (req, res) {
    Race.findOne({ id: req.params.id })
    .then(function (V) { return res.ok({ race: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {race: ID, name: STR, laps: INT, racerNumberAllowed: INT, isEntryRace: BOOL, requirePacer: BOOL, advancingRules: ARRAY}
  update: function (req, res) {
    var input = req.body
    var fields = ['name', 'nameCht', 'laps', 'racerNumberAllowed', 'isEntryRace', 'isFinalRace', 'requirePacer', 'advancingRules']
    var updateObj = dataService.returnUpdateObj(fields, input)
    var query = { id: input.id }

    Race.update(query, updateObj)
    .then(function () { return Race.findOne(query).populate('registrations') })
    .then(function (modelData) { return res.ok({ race: modelData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  delete: function (req, res) {
    var query = { id: req.params.id }
    var eventId

    Race.findOne(query).populate('group')
    .then(function (V) {
      if (V.startTime && V.startTime !== '') { throw new Error('Cannot delete a started race') }
      eventId = V.group.event
      return Race.destroy(query)
    })
    .then(function () {
      return Event.findOne({ id: eventId })
    })
    .then(function (V) {
      var raceOrder = V.raceOrder
      raceOrder.map(function (item, index) {
        if (item === query.id) { raceOrder.splice(index, 1) }
      })
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
        raceObj.toRemove.map(function (regId) {
          registrationIds = dataService.removeFromArray(regId, registrationIds)
        })
      }
      if (raceObj.toAdd && raceObj.toAdd.length > 0) {
        modified = true
        raceObj.toAdd.map(function (regId) {
          registrationIds = dataService.addToArray(regId, registrationIds)
        })
      }
      if (!modified) { return false }
      return Race.update({ id: raceObj.id }, { registrationIds: registrationIds })
    })
    .then(function () { return q.resolve() })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  // {races: [{id: ID, toAdd: [ID, ID, ID], toRemove: ID, ID, ID}, {}, {}]}
  assignRegsToRaces: function (req, res) {
    var input = req.body
    var funcs = []

    input.races.map(function (race) { funcs.push(RaceController.addRemoveRegs(race)) })

    Q.all(funcs)
    .then(function () { return res.ok(input) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, startTime: TIMESTAMP}
  startRace: function (req, res) {
    var input = req.body
    var raceObj

    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      eventId = raceData.group.event
      return Event.findOne({ id: raceData.event })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace && eventData.ongoingRace !== -1) { throw new Error('Another race ongoing') }
      return Race.update({ id: input.id }, { startTime: (input.startTime) ? input.startTime : Date.now(), raceStatus: 'started' })
    })
    .then(function (raceData) {
      raceObj = raceData[0]
      return Event.update({ id: raceObj.event }, { ongoingRace: input.id })
    })
    .then(function () { return res.ok({ race: raceObj }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID}
  resetRace: function (req, res) {
    var input = req.body

    Race.findOne({ id: input.id })
    .then(function (raceData) {
      eventId = raceData.group.event
      return Event.findOne({ id: raceData.event })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace !== input.id) { return false }
      return Event.update({ id: eventData.id }, { ongoingRace: -1 })
    })
    .then(function () {
      return Race.update({ id: input.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {}, result: [] })
    })
    .then(function (raceData) { return res.ok({ race: raceData[0] }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, endTime: TIMESTAMP}
  endRace: function (req, res) {
    var input = req.body
    var raceObj

    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'started') { throw new Error('Can only stop a started race') }
      return Race.update({ id: input.id }, { endTime: (input.endTime) ? input.endTime : Date.now(), raceStatus: 'ended' })
    })
    .then(function (raceData) {
      raceObj = raceData[0]
      return Event.update({ id: raceObj.event }, { ongoingRace: -1 })
    })
    .then(function () { return res.ok({ race: raceObj }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // { id: ID, result: [], advance: []}
  submitResult: function (req, res) {
    var input = req.body
    var raceObj

    Race.update({id: input.id}, { result: input.result, raceStatus: 'submitted' })
    .then(function (raceData) {
      var funcs = []
      raceObj = raceData[0]
      input.advance.map(function (obj) { funcs.push(RaceController.addRemoveRegs(obj)) })
      return Q.all(funcs)
    })
    .then(function () { return res.ok({ race: raceObj }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // get: 加入socket.io
  // post: 控制至尊機
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
    // rxdata: 至尊機發送讀卡資料
    // readerCtrl: 至尊機接收控制及發送狀態
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    return res.json({ result: 'join socket_channel_OK' })
  },
  // get: 加入socket.io
  // post: 發送讀卡資料
  socketImpinj: function (req, res) {
    var input = req.body
    if (input) {
      if (input.type === 'rxdata' && input.event) {
        return RaceController.insertRfid(input.event, input.payload)
        .then(function (data) {
          if (data) {
            sails.sockets.broadcast('rxdata', 'raceupdate', data)
          }
          return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
        })
        .catch(function (E) { return res.badRequest(E) })
      }
      sails.sockets.broadcast('readerCtrl', input.type, { result: input.payload })
      return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
    }
    // rxdata: 至尊機發送讀卡資料
    // readerCtrl: 至尊機接收控制及發送狀態
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
    .then(function (result) {
      return q.resolve(result)
    })
    .catch(function (E) {
      console.log('insertRfid e: ', E)
      return q.reject(E)
    })
    return q.promise
  },
  insertRfidToRace: function (raceId, entries) {
    var validRecordInterval = 10000 // 10secs
    var q = Q.defer()
    Race.findOne({id: raceId}).populate('registrations')
    .then(function (raceData) {
      if (!raceData) { return false }
      var recordsHashTable = raceData.recordsHashTable
      var hasEntry
      entries.map(function (entry) {
        if (dataService.isValidRaceRecord(entry.epc, raceData)) {
          if (!recordsHashTable[entry.epc]) {
            recordsHashTable[entry.epc] = [ entry.timestamp ]
            hasEntry = true
          } else if (dataService.isValidReadTagInterval(entry, recordsHashTable, validRecordInterval)) {
            recordsHashTable[entry.epc].push(entry.timestamp)
            hasEntry = true
          }
        }
      })
      if (!hasEntry) { return false }
      return Race.update({id: raceId}, {recordsHashTable: recordsHashTable})
    })
    .then(function (raceData) {
      if (!raceData) { return q.resolve(false) }
      return q.resolve({ race: raceData[0] })
    })
    .catch(function (E) {
      console.log('insertRfidToRace e: ', E)
      return q.reject(E)
    })
    return q.promise
  }
}

module.exports = RaceController
