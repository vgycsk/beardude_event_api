/* global dataService, Race, Registration, sails */

'use strict'

var Q = require('q')
var RegistrationController = {
  // input: { event: ID, group: ID, name: STR }, output: { group: {} }
  createReg: function (input) {
    var q = Q.defer()
    var obj = input
    dataService.returnAccessCode(obj.event)
    .then(function (accessCode) {
      obj.accessCode = accessCode
      if (!input.raceNumber) { return Registration.count({ group: input.group }) }
      return false
    })
    .then(function (V) {
      obj.raceNumber = (V) ? V + 1 : 1
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
  // input: { event: ID, group: ID, name: STR }, output: { registration: {} }
  create: function (req, res) {
    var input = req.body
    var query = {event: input.event, group: input.group, name: input.name}
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
    var fields = [
      'name',
      'epc',
      'epcSlave',
      'email',
      'accessCode',
      'phone',
      'nickName',
      'raceNumber'
    ]
    var updateObj = dataService.returnUpdateObj(fields, req.body)
    Registration.update({ id: req.body.id }, updateObj)
    .then(function (V) { return res.ok({ registration: V[0] }) })
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
        // input: { event: ID, group: ID, name: STR }, output: { group: {} }
        funcs.push(RegistrationController.createReg({
          event: input.event,
          group: reg.group,
          name: reg.name,
          nickName: reg.nickName,
          isLeaderOf: (reg.isLeader) ? teamData.id : undefined
        }))
      })
      return Q.all(funcs)
    })
    .then(function (regs) {
      output.registrations = regs
      return res.ok(output)
    })
    .catch(function (E) { return res.badRequest(E) })
  }
}
module.exports = RegistrationController
