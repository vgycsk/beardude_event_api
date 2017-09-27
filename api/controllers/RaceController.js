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
    var updateObj
    var impinjCommand
    var validIntervalMs = 3000
    return Event.findOne(query)
    .then(function (eventData) {
      if (input.action === 'start') {
        if (eventData.ongoingRace !== '' && eventData.ongoingRace !== 'testRfid') { throw new Error('Another race ongoing') }
        updateObj = { ongoingRace: 'testRfid', slaveEpcStat: {}, recordsHashTable: {} }
        impinjCommand = 'START'
        return dataService.returnSlaveEpcMap({ event: eventData.id })
      }
      if (input.action === 'reset') {
        if (eventData.ongoingRace !== '' && eventData.ongoingRace !== 'testRfid') { throw new Error('Another race ongoing') }
        updateObj = { ongoingRace: '', slaveEpcStat: {}, recordsHashTable: {} }
        impinjCommand = 'STOP'
      }
      if (input.action === 'end') {
        if (eventData.ongoingRace !== 'testRfid') { throw new Error('Not in test Rfid mode') }
        updateObj = { ongoingRace: '' }
        impinjCommand = 'STOP'
      }
      return false
    })
    .then(function (slaveEpcMapData) {
      if (slaveEpcMapData) { updateObj.slaveEpcMap = slaveEpcMapData }
      return Event.update(query, updateObj)
    })
    .then(function (eventData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', {
        command: impinjCommand,
        eventId: eventData[0].id,
        slaveEpcMap: eventData[0].slaveEpcMap,
        validIntervalMs: validIntervalMs
      })
      return res.ok({ event: eventData[0] })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, startTime: TIMESTAMP}, output: { races: [] }
  startRace: function (req, res) {
    var input = req.body
    var eventId
    var slaveEpcMap
    var validIntervalMs
    var startTime = (input.startTime) ? input.startTime : Date.now()
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      eventId = raceData.event
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace !== '') { throw new Error('Another race ongoing') }
      validIntervalMs = eventData.validIntervalMs
      return dataService.returnSlaveEpcMap({ event: eventId })
    })
    .then(function (slaveEpcMapData) {
      var eventUpdateObj = { ongoingRace: input.id }
      if (slaveEpcMapData) {
        eventUpdateObj.slaveEpcMap = slaveEpcMapData
        slaveEpcMap = slaveEpcMapData
      }
      return Event.update({ id: eventId }, eventUpdateObj)
    })
    .then(function () {
      return Race.update({ id: input.id }, { startTime: startTime, raceStatus: 'started', validIntervalMs: validIntervalMs })
    })
    .then(function (raceData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'START', raceId: input.id, slaveEpcMap: slaveEpcMap, validIntervalMs: validIntervalMs }) // start impinj
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData })
      return res.ok({ races: raceData })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID }, output: { races: [] }
  resetRace: function (req, res) {
    var output
    Race.update({ id: req.body.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {}, result: [], slaveEpcStat: {} })
    .then(function (raceData) {
      output = raceData
      return Event.update({ id: output[0].event }, { ongoingRace: '' })
    })
    .then(function (eventData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STOP', eventId: eventData[0].id }) // stop impinj
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
    .then(function (eventData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STOP', eventId: eventData[0].id }) // stop impinj
      sails.sockets.broadcast('rxdata', 'raceend', { races: output })
      return res.ok({ races: output })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // console client 加入socket.io
  socketManagement: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'rxdatatest')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STATUS' }) // get impinj status
    return res.json({ result: 'join socket_channel_OK' })
  },
  // get: 加入socket.io, post: 發送讀卡資料
  // input: { type: STR, payload: {} }
  socketImpinj: function (req, res) {
    var input = req.body
    if (input) {
      if (input.type === 'rxdata') {
        if (!input.race) { throw new Error('Race id unspecified') }
        return Race.update({ id: input.race }, input.payload)
        .then(function (raceData) {
          // Broadcast read tag
          sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData })
          return res.json({ result: 'type-' + input.type + '_receive_OK' })
        })
        .catch(function (E) { return res.badRequest(E) })
      }
      if (input.type === 'rxdatatest') {
        if (!input.event) { throw new Error('Event id unspecified') }
        return Event.update({ id: input.event }, input.payload)
        .then(function (eventData) {
          // Broadcast test rfid
          sails.sockets.broadcast('rxdatatest', 'testrfid', { event: eventData[0] })
          return res.json({ result: 'type-' + input.type + '_receive_OK' })
        })
        .catch(function (E) { return res.badRequest(E) })
      }
      // Broadcast readerstatus
      sails.sockets.broadcast('readerCtrl', input.type, { result: input.payload })
      return res.json({ result: 'type-' + input.type + '_receive_OK', input: input })
    }
    // 加入socket room. rxdata: 至尊機發送讀卡資料, readerCtrl: 至尊機接收控制及發送狀態
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'rxdatatest')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    return res.json({ result: 'join socket_channel_OK' })
  },
  // Public event, 只加入rxdata接收戰況更新
  socket: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    return res.json({ result: 'join socket_channel_OK' })
  }
}
module.exports = RaceController
