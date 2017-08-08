/* eslint-disable no-console */
/* global dataService, Event, Race, sails */

'use strict'

var Q = require('q')
var RaceController = {
  // {group: ID, name: STR, nameCht: STR, laps: INT, racerNumberAllowed: INT, requirePacer: BOOL}
  create: function (req, res) {
    Race.create(req.body)
    .then(function (modelData) { return res.ok({ race: modelData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  getInfo: function (req, res) {
    Race.findOne({ id: parseInt(req.params.id) }).populate('registrations')
    .then(function (V) { return res.ok({ race: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {race: ID, name: STR, laps: INT, racerNumberAllowed: INT, isEntryRace: BOOL, requirePacer: BOOL, advancingRules: ARRAY}
  update: function (req, res) {
    var input = req.body
    var fields = ['name', 'nameCht', 'laps', 'racerNumberAllowed', 'isEntryRace', 'isFinalRace', 'requirePacer', 'advancingRules']
    var updateObj = dataService.returnUpdateObj(fields, input)
    var query = { id: parseInt(input.id) }

    Race.update(query, updateObj)
    .then(function () { return Race.findOne(query).populate('registrations') })
    .then(function (modelData) { return res.ok({ race: modelData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  delete: function (req, res) {
    var query = { id: parseInt(req.params.id) }

    Race.findOne(query)
    .then(function (modelData) {
      if (modelData.startTime && modelData.startTime !== '') { throw new Error('Cannot delete a started race') }
      return Race.destroy(query)
    })
    .then(function () { return res.ok(query) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, toAdd: [ID, ID...], toRemove: [ID, ID...]}
  addRemoveRegs: function (raceObj) {
    var q = Q.defer()

    Race.findOne({id: raceObj.id}).populate('registrations')
    .then(function (raceData) {
      var modified

      if (raceObj.toRemove && raceObj.toRemove.length > 0) {
        modified = true
        raceObj.toRemove.map(function (regId) { raceData.registrations.remove(regId) })
      }
      if (raceObj.toAdd && raceObj.toAdd.length > 0) {
        modified = true
        raceObj.toAdd.map(function (regId) { raceData.registrations.add(regId) })
      }
      if (!modified) { return false }
      return raceData.save()
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
    var eventId

    Race.findOne({ id: input.id }).populate('group')
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      eventId = raceData.group.event
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace && eventData.ongoingRace !== -1) { throw new Error('Another race ongoing') }
      return Race.update({ id: input.id }, { startTime: (input.startTime) ? input.startTime : Date.now(), raceStatus: 'started' })
    })
    .then(function () {
      return Event.update({ id: eventId }, { ongoingRace: input.id })
    })
    .then(function (raceData) { return res.ok({ race: raceData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID}
  resetRace: function (req, res) {
    var input = req.body
    var eventId

    Race.findOne({ id: input.id }).populate('group')
    .then(function (raceData) {
      eventId = raceData.group.event
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace !== input.id) { return false }
      return Event.update({ id: eventId }, { ongoingRace: -1 })
    })
    .then(function () {
      return Race.update({ id: input.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {}, result: [] })
    })
    .then(function (raceData) { return res.ok({ race: raceData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, endTime: TIMESTAMP}
  endRace: function (req, res) {
    var input = req.body
    var eventId

    Race.findOne({ id: input.id }).populate('group')
    .then(function (raceData) {
      if (raceData.raceStatus !== 'started') { throw new Error('Can only stop a started race') }
      eventId = raceData.group.event
      return Race.update({ id: input.id }, { endTime: (input.endTime) ? input.endTime : Date.now(), raceStatus: 'ended' })
    })
    .then(function (raceData) {
      return Event.update({ id: eventId }, { ongoingRace: -1 })
    })
    .then(function (raceData) { return res.ok({ race: raceData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // { id: ID, result: [], advance: []}
  submitResult: function (req, res) {
    var input = req.body

    Race.update({id: input.id}, { result: input.result, raceStatus: 'submitted' })
    .then(function (raceData) {
      var funcs = []
      input.advance.map(function (obj) { funcs.push(RaceController.addRemoveRegs(obj)) })
      return Q.all(funcs)
    })
    .then(function () { return res.ok({ race: { id: input.id } }) })
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
            sails.sockets.broadcast('rxdata', 'raceupdate', { result: {
              id: data.race.id, recordsHashTable: data.race.recordsHashTable
            } })
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
      if (eventData) { return Event.update({ id: eventId }, { rawRfidData: eventData.rawRfidData.concat(entries) }) }
      return false
    })
    .then(function (eventData) {
      if (eventData && eventData.length > 0 && eventData[0].ongoingRace !== -1) { return Race.findOne({id: eventData[0].ongoingRace}).populate('registrations') }
      return false
    })
    .then(function (raceData) {
      if (!raceData) { return false }
      var recordsHashTable = raceData.recordsHashTable
      var hasEntry

      entries.map(function (entry) {
        if (dataService.isValidRaceRecord(entry.epc, raceData)) {
          if (!recordsHashTable[entry.epc]) { recordsHashTable[entry.epc] = [] }
          recordsHashTable[entry.epc].push(entry.timestamp)
          hasEntry = true
        }
      })
      if (hasEntry) { return Race.update({id: raceData.id}, {recordsHashTable: recordsHashTable}) }
    })
    .then(function (raceData) {
      if (!raceData) { return q.resolve(false) }
      return q.resolve({ race: raceData[0] })
    })
    .catch(function (E) {
      console.log('insertRfid e: ', E)
      return q.reject(E)
    })
    return q.promise
  }
}

module.exports = RaceController
