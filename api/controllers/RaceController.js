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
    var updateObj = { ongoingRace: '' }
    var impinjCommand = 'STOP'
    var systemObj = { ongoingEvent: '', ongoingRace: '', slaveEpcMap: {} }

    return Event.findOne(query)
    .then(function (eventData) {
      if (input.action === 'start') {
        if (eventData.ongoingRace !== '' && eventData.ongoingRace !== 'testRfid') { throw new Error('Another race ongoing') }
        updateObj = { ongoingRace: 'testRfid', slaveEpcStat: {}, recordsHashTable: {} }
        impinjCommand = 'START'
        systemObj = { ongoingEvent: input.id, ongoingRace: 'testRfid' }
        return dataService.returnSlaveEpcMap({ event: eventData.id })
      }
      if (input.action === 'reset') {
        if (eventData.ongoingRace !== '') { throw new Error('Another race ongoing') }
        updateObj = { ongoingRace: '', slaveEpcStat: {}, recordsHashTable: {} }
      }
      if (input.action === 'end' && eventData.ongoingRace !== '' && eventData.ongoingRace !== 'testRfid') {
        throw new Error('Not in test Rfid mode')
      }
      return false
    })
    .then(function (slaveEpcMapData) {
      if (slaveEpcMapData) {
        updateObj.slaveEpcMap = slaveEpcMapData
        systemObj.slaveEpcMap = slaveEpcMapData
      }
      return System.update({ key: 0 }, systemObj)
    })
    .then(function () {
      return Event.update(query, updateObj)
    })
    .then(function (eventData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', {
        command: impinjCommand,
        eventId: input.id,
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
    var systemObj
    var raceResult
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
      systemObj = { ongoingEvent: eventId, ongoingRace: input.id, slaveEpcMap: slaveEpcMapData }
      return Event.update({ id: eventId }, { ongoingRace: input.id, slaveEpcMap: slaveEpcMapData })
    })
    .then(function () {
      return Registration.find({ event: raceDataObj.event })
    })
    .then(function (regData) {
      raceResult = dataService.returnRaceResult(raceDataObj, regData)
      return Race.update({ id: input.id }, { startTime: startTime, raceStatus: 'started', result: raceResult })
    })
    .then(function (raceData) {
      raceDataObj = raceData
      return System.update({ key: 0 }, systemObj)
    })
    .then(function (systemData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', {
        command: 'START',
        eventId: eventId,
        raceId: input.id
      }) // start impinj
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceDataObj }) // send race data to clients
      setTimeout(function () {
        sails.sockets.broadcast('rxdatapublic', 'raceupdate', { races: raceDataObj }) // Broadcast read tag
        Race.update({ id: input.id }, { startTimeWithLatency: startTime, raceStatusWithLatency: 'started', result: raceResult })
      }, systemData[0].resultLatency)
      return res.ok({ races: raceDataObj, system: systemData[0] })
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
    .then(function () {
      return System.update({ key: 0 }, { ongoingEvent: '', ongoingRace: '', slaveEpcMap: {} })
    })
    .then(function (systemData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STOP' }) // stop impinj
      sails.sockets.broadcast('rxdata', 'raceend', { races: output })
      setTimeout(function () {
        sails.sockets.broadcast('rxdatapublic', 'raceend', { races: output }) // Broadcast read tag
        Race.update({ id: req.body.id }, { startTimeWithLatency: undefined, endTime: undefined, raceStatusWithLatency: 'init', resultWithLatency: [] })
      }, systemData[0].resultLatency)
      return res.ok({ races: output, system: systemData[0] })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID, endTime: TIMESTAMP}, output: { races: [] }
  endRace: function (req, res) {
    var input = req.body
    var output
    var endTime = (input.endTime) ? input.endTime : Date.now()
    Race.findOne({ id: input.id })
    .then(function (raceData) {
      if (raceData.raceStatus !== 'started') { throw new Error('Can only stop a started race') }
      return Race.update({ id: input.id }, { endTime: endTime, raceStatus: 'ended' })
    })
    .then(function (raceData) {
      output = raceData
      return Event.update({ id: output[0].event }, { ongoingRace: '' })
    })
    .then(function () {
      return System.update({ key: 0 }, { ongoingEvent: '', ongoingRace: '', slaveEpcMap: {} })
    })
    .then(function (systemData) {
      sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STOP' }) // stop impinj
      sails.sockets.broadcast('rxdata', 'raceend', { races: output })
      setTimeout(function () {
        sails.sockets.broadcast('rxdatapublic', 'raceend', { races: output }) // Broadcast read tag
        Race.update({ id: input.id }, { endTime: endTime, raceStatusWithLatency: 'ended' })
      }, systemData[0].resultLatency)
      return res.ok({ races: output, system: systemData[0] })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // Console app 加入socket.io
  // TO DO: 回傳eventId & isSingulating狀態
  socketManagement: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    sails.sockets.broadcast('readerCtrl', 'readercommand', { command: 'STATUS' }) // get impinj status
    System.findOne({ key: 0 })
    .then(function (systemData) {
      return res.json({ system: systemData })
    })
  },
  // Public event 加入 rxdatapublic 接收戰況更新. 有別於 rxdata, 這個chatroom可配合latency更新狀態
  socketPublic: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdatapublic')
    System.findOne({ key: 0 })
    .then(function (systemData) {
      return res.json({ system: systemData })
    })
  },
  // get: 加入socket.io. rxdata: 至尊機發送讀卡資料, readerCtrl: 至尊機接收控制及發送狀態
  // TO DO: 回傳eventId & isSingulating狀態
  socketImpinj: function (req, res) {
    sails.sockets.join(req.query.sid, 'rxdata')
    sails.sockets.join(req.query.sid, 'readerCtrl')
    System.findOne({ key: 0 })
    .then(function (systemData) {
      return res.json({ system: systemData })
    })
  },
  // 接收到測試讀取時，將資料塞入event, 並透過socket.io廣播
  insertTestReadsToEvent: function (systemObj, payload) {
    var q = Q.defer()

    Event.findOne({ id: systemObj.ongoingEvent })
    .then(function (eventData) {
      var result = dataService.updateRfidRecords(payload.records, eventData.recordsHashTable, eventData.slaveEpcStat, eventData.slaveEpcMap, systemObj.testIntervalMs)
      return Event.update({ id: payload.eventId }, { recordsHashTable: result.recordsHashTable, slaveEpcStat: result.slaveEpcStat })
    })
    .then(function (eventData) {
      sails.sockets.broadcast('rxdata', 'testrfid', { event: eventData[0] }) // Broadcast read tag
      return q.resolve({ event: eventData[0] })
    })
    .catch(function (E) {
      return q.reject(E)
    })
    return q.promise
  },
  // 接收到正式比賽資料時，將資料塞入race, 並透過socket.io廣播
  insertOfficalReadsToRace: function (systemObj, payload) {
    var q = Q.defer()
    var raceObj
    var resultObj
    Race.findOne({ id: systemObj.ongoingRace })
    .then(function (raceData) {
      raceObj = raceData
      resultObj = dataService.updateRfidRecords(payload.records, raceObj.recordsHashTable, raceObj.slaveEpcStat, systemObj.slaveEpcMap, systemObj.validIntervalMs)
      raceObj.recordsHashTable = resultObj.recordsHashTable
      raceObj.slaveEpcStat = resultObj.slaveEpcStat
      return Registration.find({ event: systemObj.ongoingEvent })
    })
    .then(function (regData) {
      var result = dataService.returnRaceResult(raceObj, regData)
      // 載入 public site 有設定延遲的成績
      setTimeout(function () {
        Race.update({ id: systemObj.ongoingRace }, { resultWithLatency: result })
      }, systemObj.resultLatency)
      return Race.update({ id: systemObj.ongoingRace }, { recordsHashTable: raceObj.recordsHashTable, slaveEpcStat: raceObj.slaveEpcStat, result: result })
    })
    .then(function (raceData) {
      sails.sockets.broadcast('rxdata', 'raceupdate', { races: raceData }) // Broadcast read tag
      // 發送 public site 有設定延遲的成績
      setTimeout(function () {
        sails.sockets.broadcast('rxdatapublic', 'raceupdate', { races: raceData }) // Broadcast read tag
      }, systemObj.resultLatency)
      return q.resolve({ races: raceData })
    })
    .catch(function (E) {
      return q.reject(E)
    })
    return q.promise
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
        "eventId": "event-id",
        "records": [
          {"epc": "epc-string", time: timestamp-long}
        ]
      }
  }
    */
  socketImpinjReceiver: function (req, res) {
    var type = req.body.type
    var payload = req.body.payload

    return System.findOne({ key: 0 })
    .then(function (systemData) {
      if (type === 'readerstatus') {
        sails.sockets.broadcast('readerCtrl', type, { result: payload })
        if (systemData.ongoingRace !== '' && payload.logFile) {
          return Race.update({ id: systemData.ongoingRace }, { logFile: payload.logFile })
        }
      } else if (type === 'txdata') {
        // 判斷目前進行中的是測試或特定賽程
        switch (systemData.ongoingRace) {
          case '':
            return console.log('No ongoing event or race')
          case 'testRfid':
            return RaceController.insertTestReadsToEvent(systemData, payload)
          default:
            return RaceController.insertOfficalReadsToRace(systemData, payload)
        }
      }
    })
    .then(function () { return res.json({ result: 'type-' + type + '_receive_OK' }) })
    .catch(function (E) { return res.badRequest(E) })
  }
}
module.exports = RaceController
