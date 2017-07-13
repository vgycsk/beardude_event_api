/* eslint-disable no-console */
/* global dataService, Group, Race, sails */

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
      var result = V.toJSON()

      delete result.pacerEpc
      delete result.testerEpc
      delete result.rfidData
      return res.ok({ race: result })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // Get complete info
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
  // /:action (add||remove) {id: ID, registrations: [ID, ID...]}
  assignRacers: function (req, res) {
    var input = req.body
    var action = req.params.action

    Race.findOne({ id: input.id }).populate('registrations')
    .then(function (V) {
      input.registrations.forEach(function (regId) { V.registrations[action](regId) })
      return V.save()
    })
    .then(function () { return res.ok({ message: 'racers assigned successfully', id: input.id, registrations: input.registrations }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  getParsedRaceResult: function (req, res) {
    Race.findOne({ id: parseInt(req.params.id) }).populate('registrations')
      .then(function (raceData) {
        if (!raceData.startTime || raceData.startTime === '') {
          throw new Error('Race not started')
        }
        if (!raceData.endTime || raceData.endTime === '') {
          throw new Error('Race not finished')
        }
        return res.ok(dataService.returnParsedRaceResult(raceData.recordsHashTable, raceData.laps, raceData.registrations))
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // 晉級規則 advancingRule: { rankFrom: INT, rankTo: INT, toRace: ID, insertAt: INT }
  // 該場比賽排名 rankings: [{registration: ID, time: INT/'dnf'}, {...}]
  advancingRacerToRace: function (advancingRule, rankings) {
    var q = Q.defer()

    Race.findOne({ id: advancingRule.toRace }).populate('registrations')
      .then(function (raceData) {
        var i
        var regId

        for (i = advancingRule.rankFrom; i <= advancingRule.rankTo; i += 1) {
          regId = rankings[i].registration
          raceData.registrations.add(regId)
        }
        return raceData.save()
      })
      .then(function () {
        return q.resolve({ message: 'Racers allocated to coming races', race: advancingRule.toRace, rankFrom: advancingRule.rankFrom, rankTo: advancingRule.rankTo })
      })
      .catch(function (E) {
        return q.reject(E)
      })
    return q.promise
  },
    /* {
        id: ID,
        rankings: [{registration: ID, time: INT/'dnf'}],
        disqualified: [{registration: ID, time: INT/dnf}]
    } */
  submitRaceResult: function (req, res) {
    var input = req.body
    var advancingRules
    var completeRanking
    var groupId

    Race.findOne({ id: input.id })
      .then(function (V) {
        var funcs = []

        advancingRules = V.advancingRules
        groupId = V.group
        if (advancingRules.length === 0) { return false }
        funcs = advancingRules.map(function (rule) {
          return RaceController.advancingRacerToRace(rule, input.rankings)
        })
        return Q.all(funcs)
      })
      .then(function () {
        completeRanking = input.rankings.concat(input.disqualified)
        return Race.update({ id: input.id }, { result: completeRanking })
      })
      .then(function () {
        if (advancingRules.length === 0) {
          return Group.update({ id: groupId }, { result: completeRanking })
        }
        return false
      })
      .then(function (groupData) {
        var result = { message: 'Result submitted', race: input.id }

        if (groupData) {
          result.group = groupData[0].id
        }
        return res.ok(result)
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },

  /**
  * join | register to reader room
  * java (reader) side doesnt sent by sails.socket.io.get, so making a query string as flag to make sure its socket connection
  * but just use sails.socket.io.get when js call
  **/
  joinReaderRoom: function (req, res) {
    var query = req.query
    var joinSocket = query.sid
    var isSocket = query.isSocket

    if (!joinSocket) {
      joinSocket = req
    }
    if (!isSocket) {
      if (!req.isSocket) {
        return res.badRequest()
      }
      isSocket = req.isSocket
    }
        // let the connection join the socket channel
    sails.sockets.join(joinSocket, 'readerSockets')
    return res.json({ result: 'join socket_channel_OK' })
  },

  /**
  * reader accessing, including starting, receiving race data, terminating
  **/
  readerReceiver: function (req, res) {
    var isSocket = req.isSocket
    var socketReq = req.query.sid
    var input = req.body
    var type = input.type
    var payload = input.payload

    if (!isSocket) {
      if (!req.query.isSocket) {
        return res.badRequest()
      }
      isSocket = req.query.isSocket
    }
    if (!socketReq) {
      socketReq = req
    }
    switch (type) {
      case 'startreader':
        sails.sockets.broadcast('readerSockets', 'startreader', { result: 'success' }, socketReq)
        break
      case 'rxdata':
            // change the 'rxdata' for mapping a unique event name to a reader, if there are other readers.
        console.log('broadcast rxdata')
        sails.sockets.broadcast('readerSockets', 'rxdata', { result: payload }, socketReq)
            // to-do: write to DB
        break
      case 'terminatereader':
        sails.sockets.broadcast('readerSockets', 'terminatereader', { result: 'success' }, socketReq)
        break
      default:
        break
    }
    return res.json({ result: 'type-' + type + '_receive_OK' })
  }
}

module.exports = RaceController
