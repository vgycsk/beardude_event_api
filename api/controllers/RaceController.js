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
  // Get public info
  getGeneralInfo: function (req, res) {
    Race.findOne({ id: parseInt(req.params.id) }).populate('registrations')
    .then(function (V) { return res.ok({ race: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  getManagementInfo: function (req, res) {
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
      return Race.update({ id: input.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {} })
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
  /**
  * join | register to reader room
  * java (reader) side doesnt sent by sails.socket.io.get, so making a query string as flag to make sure its socket connection
  * but just use sails.socket.io.get when js call
  **/
  joinReaderRoom: function (req, res) {
    var isSocket = (req.query.isSocket) ? req.query.isSocket : req.isSocket
    var socketReq = (req.query.sid) ? req.query.sid : req

    if (!isSocket) { return res.badRequest() }
    /* Send eventId when joining reader room. Azai: Not sure how Java's socket.io get the value?
    Event.findOne({ isRfidTerminal: true })
    .then(function (eventData) {
      var eventId = eventData
      sails.sockets.join(socketReq, 'readerSockets')
      sails.sockets.broadcast('readerSockets', 'join', { eventId: eventId }, socketReq)
      return res.json({ result: 'join socket_channel_OK' })
    })
    */
    sails.sockets.join(socketReq, 'readerSockets')
    return res.json({ result: 'join socket_channel_OK' })
  },
  /**
  * reader accessing, including starting, receiving race data, terminating
  **/
  readerReceiver: function (req, res) {
    var input = req.body
//    var socketReq = (req.query.sid) ? req.query.sid : sails.sockets.getId(req)

    if (!req.isSocket && !req.query.isSocket) { return res.badRequest() }
    try {
      switch (input.type) {
        case 'rxdata': // RFID reader sending report
          return RaceController.insertRfid(input.event, input.payload)
          .then(function (data) {
            if (data) {
              var result = { id: data.race.id, recordsHashTable: data.race.recordsHashTable }
              sails.sockets.broadcast('readerSockets', 'raceupdate', { result: result })
            }
            return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
          })
          .catch(function (E) { return res.badRequest(E) })
        default:
          sails.sockets.broadcast('readerSockets', input.type, { result: input.payload })
          return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
      }
    } catch (E) {
      console.log('readerReceiver e: ', E)
    }
  },
  insertRfid: function (eventId, entriesRaw) {
    var q = Q.defer()
    var entries = entriesRaw.map(function (entry) { return { epc: entry.epc, timestamp: parseInt(entry.timestamp) } })

    Event.findOne({id: eventId})
    .then(function (eventData) {
      return Event.update({ id: eventId }, { rawRfidData: eventData.rawRfidData.concat(entries) })
    })
    .then(function (eventData) {
      if (eventData[0].ongoingRace !== -1) { return Race.findOne({id: eventData[0].ongoingRace}).populate('registrations') }
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
