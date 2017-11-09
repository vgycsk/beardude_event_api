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
        mode: 'test',
        eventId: eventData[0].id
      })
      return res.ok({ event: eventData[0] })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, startTime: TIMESTAMP}, output: { races: [] }
  startRace: function (req, res) {
    var input = req.body
    var eventId
    var startTime = (input.startTime) ? input.startTime : Date.now()
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      eventId = raceData.event
      return Event.findOne({ id: eventId })
    })
    .then(function (eventData) {
      if (eventData.ongoingRace !== '') { throw new Error('Another race ongoing') }
      return dataService.returnSlaveEpcMap({ event: eventId })
    })
    .then(function (slaveEpcMapData) {
      return Event.update({ id: eventId }, { ongoingRace: input.id, slaveEpcMap: slaveEpcMapData })
    })
    .then(function () {
      return Race.update({ id: input.id }, { startTime: startTime, raceStatus: 'started' })
    })
    .then(function (raceData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', {
        command: 'START',
        mode: 'race',
        eventId: eventId,
        raceId: input.id
      }) // start impinj
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData }) // send race data to clients
      return res.ok({ races: raceData })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID }, output: { races: [] }
  // DANGER: Hide this function on console app. requires additional step to reveal this
  resetRace: function (req, res) {
    var output
    Race.update({ id: req.body.id }, { startTime: undefined, endTime: undefined, raceStatus: 'init', recordsHashTable: {}, result: [], slaveEpcStat: {} })
    .then(function (raceData) {
      output = raceData
      return Event.update({ id: output[0].event }, { ongoingRace: '' })
    })
    .then(function (eventData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STOP' }) // stop impinj
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
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STOP' }) // stop impinj
      sails.sockets.broadcast('rxdata', 'raceend', { races: output })
      return res.ok({ races: output })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // Console app 加入socket.io
  socketManagement: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STATUS' }) // get impinj status
    return res.json({ result: 'join socket_channel_OK' })
  },
  // Public event 加入 rxdatapublic 接收戰況更新. 有別於 rxdata, 這個chatroom可配合latency更新狀態
  socketPublic: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdatapublic')
    return res.json({ result: 'join socket_channel_OK' })
  },
  // get: 加入socket.io. rxdata: 至尊機發送讀卡資料, readerCtrl: 至尊機接收控制及發送狀態
  socketImpinj: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    return res.json({ result: 'join socket_channel_OK' })
  },
  /* socket.io 回傳單筆或完整資料: {
      type: 'rxdata',
      message: STR,
      error: BOOL,
      payload: {
        mode: 'test' || 'race' || 'dev'
        event: INT,
        race: INT,
        startTime: LONG, (optional)
        endTime: LONG, (optional)
        records: [],
        recordType: 'partial' || 'complete'
      }
  } */
  socketImpinjReceiver: function (req, res) {
    var type = req.body.type
    var payload = req.body.payload
    var modelData
    if (type === 'readerstatus') {  // case 1: Reader returning reader status
      sails.sockets.broadcast('readerCtrl', type, { result: payload })
      return res.json({ result: 'type-' + type + '_receive_OK' })
    }
    if (payload.mode === 'race') {
      if (!payload.race) { throw new Error('Race ID unspecified') }
      return Race.findOne({ id: payload.race })
      .then(function (raceData) {
        modelData = raceData
        return Event.findOne({ id: raceData.event })
      })
      .then(function (eventData) {
        var result = dataService.updateRfidRecords(payload.records, modelData.recordsHashTable, modelData.slaveEpcStat, eventData.slaveEpcMap, eventData.validIntervalMs)
        return Race.update({ id: payload.race }, { recordsRaw: modelData.recordsRaw.concat(payload.records), recordsHashTable: result.recordsHashTable, slaveEpcStat: result.slaveEpcStat })
      })
      .then(function (raceData) {
        sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData }) // Broadcast read tag
        return res.json({ result: 'type-' + type + '_receive_OK' })
      })
      .catch(function (E) { return res.badRequest(E) })
    } else if (payload.mode === 'test') {
      if (!payload.event) { throw new Error('Event ID unspecified') }
      return Event.findOne({ id: payload.event })
      .then(function (eventData) {
        var result = dataService.updateRfidRecords(payload.records, eventData.recordsHashTable, eventData.slaveEpcStat, eventData.slaveEpcMap, eventData.validIntervalMs)
        return Event.update({ id: payload.event }, { recordsRaw: eventData.recordsRaw.concat(payload.records), recordsHashTable: result.recordsHashTable, slaveEpcStat: result.slaveEpcStat })
      })
      .then(function (eventData) {
        sails.sockets.broadcast('rxdata', 'testrfid', { event: eventData[0] }) // Broadcast read tag
        return res.json({ result: 'type-' + type + '_receive_OK' })
      })
      .catch(function (E) { return res.badRequest(E) })
    }
  }
}
module.exports = RaceController
