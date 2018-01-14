/* global dataService, Race, Registration, sails */

'use strict'

var Q = require('q')
var RegistrationController = {
  // input: { event: ID, group: ID, name: STR, nickName: STR, phone: STR, email: STR, raceNumber: STR }
  // output: { registration: {} }
  createReg: function (input) {
    var q = Q.defer()
    var obj = input

    dataService.returnAccessCode(obj.event)
    .then(function (accessCode) {
      obj.accessCode = accessCode
      if (input.raceNumber) {
        return dataService.requestRaceNumber(input.event, input.raceNumber)
      }
      return dataService.assignRaceNumber(input.event)
    })
    .then(function (raceNumber) {
      obj.raceNumber = raceNumber
      return Registration.create(obj)
    })
    .then(function (V) {
      var result = V.toJSON()
      result.races = []
      return q.resolve(result)
    })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  // input: { event: ID, group: ID, name: STR, email: STR }, output: { registration: {} }
  create: function (req, res) {
    var input = req.body
    var query = {event: input.event, group: input.group, email: input.email}
    Registration.findOne(query)
    .then(function (modelData) {
      if (modelData) { throw new Error('Already registered') }
      return RegistrationController.createReg(input)
    })
    .then(function (modelData) { return res.ok({ registration: modelData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID, name: STR }, output: { registration: {} }
  update: function (req, res) {
    var input = req.body
    var fields = [
      'name',
      'epc',
      'epcSlave',
      'email',
      'phone',
      'nickName',
      'regNotes',
      'raceNotes'
//      'raceNumber'
    ]
    var updateObj = dataService.returnUpdateObj(fields, input)
    var output

    Registration.update({ id: input.id }, updateObj)
    .then(function (V) {
      output = V[0]
      if (input.raceNumber && input.raceNumber !== '') {
        return dataService.requestRaceNumber(output.event, input.raceNumber, output.raceNumber)
      }
      return false
    })
    .then(function (V) {
      if (V) {
        return Registration.update({ id: input.id }, { raceNumber: V })
      }
      return false
    })
    .then(function (V) {
      if (V) { output = V[0] }
      return res.ok({ registration: output })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: /:id  output: { registration: { id: ID }, races: [] } 1. Find and remove registrationIds from races, 2. remove reg
  delete: function (req, res) {
    var query = {id: req.params.id}
    var result = { registration: query }
    Registration.findOne(query)
    .then(function (V) {
      if (V.paymentStatus === 'paid') { throw new Error('Cannot delete paid registration') }
      return Race.find({ group: V.group })
    })
    .then(function (races) {
      var funcs = []
      races.map(function (race) {
        var updateObj = { id: race.id, registrationIds: race.registrationIds }
        var toUpdate
        updateObj.registrationIds.map(function (regId, index) {
          if (regId === query.id) {
            updateObj.registrationIds.splice(index, 1)
            toUpdate = true
          }
        })
        if (toUpdate) { funcs.push(Race.update({ id: updateObj.id }, { registrationIds: updateObj.registrationIds })) }
      })
      if (funcs.length > 0) { return Q.all(funcs) }
      return false
    })
    .then(function (raceData) {
      if (raceData) { result.races = raceData.map(function (race) { return race[0] }) }
      return Registration.destroy(query)
    })
    .then(function (V) { return res.ok(result) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // 情境1: 隊伍跟選手都是新的 -> 1) 輸入隊伍及選手資料 2) 報名
  // {event: ID, team: {name: STR, desc: STR}, registrations: [{email: STR, name: STR, group: ID, isLeader: BOOL}]}
  signupAndCreateTeam: function (req, res) {
    var input = req.body
    var funcs = []
    var output = {}

    sails.controllers.team.createTeam(input.team)
    .then(function (teamData) {
      output.team = teamData
      input.registrations.map(function (reg) {
        funcs.push(RegistrationController.createReg({
          event: input.event,
          group: reg.group,
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          nickName: reg.nickName,
          raceNumber: reg.raceNumber,
          regNotes: reg.regNotes
        }))
      })
      return Q.all(funcs)
    })
    .then(function (regs) {
      var leaderId
      regs.map(function (reg) {
        if (reg.name === input.registrations[0].name) {
          leaderId = reg.id
        }
      })
      output.registrations = regs
      if (leaderId) {
        return sails.controllers.team.assignLeader(output.team.id, leaderId)
      }
      return false
    })
    .then(function (teamData) {
      if (teamData) { output.team = teamData }
      return res.ok(output)
    })
    .catch(function (E) { return res.badRequest(E) })
  }
}
module.exports = RegistrationController
