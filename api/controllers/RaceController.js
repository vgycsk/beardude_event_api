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
    .then(function (V) {
      return res.ok({ race: V })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  getManagementInfo: function (req, res) {
    Race.findOne({ id: parseInt(req.params.id) }).populate('registrations')
    .then(function (modelData) { return res.ok({ race: modelData }) })
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
  // {raceId: ID, toAdd: [ID, ID...], toRemove: [ID, ID...]}
  addRemoveRegs: function (raceObj) {
    var q = Q.defer()

    Race.findOne({id: raceObj.id}).populate('registrations')
    .then(function (raceData) {
      if (raceObj.toRemove && raceObj.toRemove.length > 0) {
        raceObj.toRemove.map(function (regId) { raceData.registrations.remove(regId) })
      }
      if (raceObj.toAdd && raceObj.toAdd.length > 0) {
        raceObj.toAdd.map(function (regId) { raceData.registrations.add(regId) })
      }
      return raceData.save()
    })
    .then(function () { q.resolve() })
    .catch(function (E) { q.reject(E) })
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

    Race.findOne({ id: input.id }).populate('registrations').populate('group')
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      if (raceData.registrations.length === 0) { throw new Error('Cannot start a race without racers') }
      eventId = raceData.group.event
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace && eventData.ongoingRace !== -1) { throw new Error('Another race ongoing') }
      return Race.update({ id: input.id }, { startTime: (input.startTime) ? input.startTime : Date.now(), raceStatus: 'started' })
    })
    .then(function (raceData) {
      return Event.update({ id: eventId }, { ongoingRace: input.id })
    })
    .then(function () { return Race.findOne({ id: input.id }).populate('registrations') })
    .then(function (raceData) { return res.ok({ race: raceData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID}
  resetRace: function (req, res) {
    var input = req.body
    var eventId

    Race.findOne({ id: input.id }).populate('registrations').populate('group')
    .then(function (raceData) {
      if (raceData.result.length > 0) { throw new Error('Cannot cancel a submitted race') }
      eventId = raceData.group.event
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace !== input.id && eventData.ongoingRace !== -1) { throw new Error('Can only cancel an ongoing race') }
      return Event.update({ id: eventId }, { ongoingRace: -1 })
    })
    .then(function () {
      return Race.update({ id: input.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {} })
    })
    .then(function () { return Race.findOne({ id: input.id }).populate('registrations') })
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
    .then(function () { return Race.findOne({ id: input.id }).populate('registrations') })
    .then(function (raceData) { return res.ok({ race: raceData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, raceResult: {}}. raceResult optional
  submitResult: function (req, res) {
    var input = req.body
    var raceResult
    var raceObj

    Race.findOne({id: input.id}).populate('registrations').populate('group')
    .then(function (raceData) {
      var hashTable = (input.raceResult) ? input.raceResult : raceData.recordsHashTable

      raceResult = dataService.returnSortedResultFromHashTable(hashTable, raceData.registrations)
      return Race.update({ id: input.id }, { result: raceResult, raceStatus: 'submitted' })
    })
    .then(function (racedata) {
      var advancingRules = racedata[0].advancingRules
      var funcs = []

      raceObj = racedata[0]
      if (advancingRules.length > 0) {
        advancingRules.map(function (rule) {
          funcs.push(RaceController.addRemoveRegs(dataService.returnMatchedRegsFromRule(rule, raceResult)))
        })
        return Q.all(funcs)
      }
      return false
    })
    .then(function () {
      return Event.update({ id: raceObj.group.event }, { ongoingRace: -1 })
    })
    .then(function () {
      return res.ok({ race: raceObj })
    })
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
    Event.findOne({ isRfidTerminal: true })
    .then(function (eventData) {
      var eventId = eventData
      sails.sockets.join(socketReq, 'readerSockets')
      sails.sockets.broadcast('readerSockets', 'join', { eventId: eventId }, socketReq)
      return res.json({ result: 'join socket_channel_OK' })
    })
  },
  /**
  * reader accessing, including starting, receiving race data, terminating
  **/
  readerReceiver: function (req, res) {
    var isSocket = (req.isSocket) ? req.isSocket : req.query.isSocket
    var socketReq = (req.query.sid) ? req.query.sid : req
    var input = req.body

    if (!isSocket) { return res.badRequest() }
    sails.sockets.broadcast('readerSockets', input.type, { result: input.payload }, socketReq)
    return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
  }
}

module.exports = RaceController
