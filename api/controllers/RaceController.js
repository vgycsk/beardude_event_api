/* global dataService, Event, Race, Registration, sails */

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
        if (eventData.ongoingRace !== '') { throw new Error('Another race ongoing') }
        updateObj = { ongoingRace: '', slaveEpcStat: {}, recordsHashTable: {} }
        impinjCommand = 'STOP'
      }
      if (input.action === 'end') {
        if (eventData.ongoingRace !== '' && eventData.ongoingRace !== 'testRfid') { throw new Error('Not in test Rfid mode') }
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
        raceId: ''
      })
      return res.ok({ event: eventData[0] })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, startTime: TIMESTAMP}, output: { races: [] }
  startRace: function (req, res) {
    var input = req.body
    var eventId
    var raceDataObj
    var startTime = (input.startTime) ? input.startTime : Date.now()
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'init') { throw new Error('Can only start an init race') }
      eventId = raceData.event
      raceDataObj = raceData
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
      return Registration.find({ event: raceDataObj.event })
    })
    .then(function (regData) {
      var raceResult = dataService.returnRaceResult(raceDataObj, regData)
      return Race.update({ id: input.id }, { startTime: startTime, raceStatus: 'started', result: raceResult })
    })
    .then(function (raceData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', {
        command: 'START',
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
  /*
  socket.io 回傳至尊機狀態:
    {
      "type": "readerstatus",
      "payload": {
        "message": "reader command message",
        "error": true || false,
        "isSingulating": true || false,
        "startTime": timestamp-long,  // returns only on START command
        "endTime": timestamp-long,  // returns only on STOP command
        "logFile": "logfile-path"
      }
    }
  socket.io 回傳單筆或完整資料:
    {
      type: 'txdata',
      payload: {
        "raceId": "race-id",
        "records": [
          {"epc": "epc-string", time: timestamp-long}
        ]
      }
    {
      type: 'txdata_test',
      payload: {
        "raceId": "event-id",
        "records": [
          {"epc": "epc-string", time: timestamp-long}
        ]
      }
  }
    */
  socketImpinjReceiver: function (req, res) {
    var type = req.body.type
    var payload = req.body.payload
    var modelData

    switch (type) {
      case 'readerstatus':
        sails.sockets.broadcast('readerCtrl', type, { result: payload })
        res.json({ result: 'type-' + type + '_receive_OK' })
        break
      case 'txdata_test':
        Event.findOne({ id: payload.eventId })
        .then(function (eventData) {
          var testTagInterval = 1000
          var result = dataService.updateRfidRecords(payload.records, eventData.recordsHashTable, eventData.slaveEpcStat, eventData.slaveEpcMap, testTagInterval)
          var recordsRawOrg = eventData.recordsRaw || []
          return Event.update({ id: payload.eventId }, { recordsRaw: recordsRawOrg.concat(payload.records), recordsHashTable: result.recordsHashTable, slaveEpcStat: result.slaveEpcStat })
        })
        .then(function (eventData) {
          sails.sockets.broadcast('rxdata', 'testrfid', { event: eventData[0] }) // Broadcast read tag
          return res.json({ result: 'type-' + type + '_receive_OK' })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
        break
      case 'txdata':
        Race.findOne({ id: payload.raceId })
        .then(function (raceData) {
          modelData = raceData.toJSON()
          return Event.findOne({ id: raceData.event })
        })
        .then(function (eventData) {
          var resultObj = dataService.updateRfidRecords(payload.records, modelData.recordsHashTable, modelData.slaveEpcStat, eventData.slaveEpcMap, eventData.validIntervalMs)
          var recordsRawOrg = modelData.recordsRaw || []
          modelData.recordsRaw = recordsRawOrg.concat(payload.records)
          modelData.recordsHashTable = resultObj.recordsHashTable
          modelData.slaveEpcStat = resultObj.slaveEpcStat
          return Registration.find({ event: modelData.event })
        })
        .then(function (regData) {
          var raceResult = dataService.returnRaceResult(modelData, regData)
          return Race.update({ id: payload.raceId }, { recordsRaw: modelData.recordsRaw, recordsHashTable: modelData.recordsHashTable, slaveEpcStat: modelData.slaveEpcStat, result: raceResult })
        })
        .then(function (raceData) {
          sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData }) // Broadcast read tag
          return res.json({ result: 'type-' + type + '_receive_OK' })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
        break
      default:
        return res.json({ result: 'type-' + type + '_receive_OK' })
    }
  }
}
module.exports = RaceController
