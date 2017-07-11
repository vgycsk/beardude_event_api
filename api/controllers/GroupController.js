/* global dataService, Group, Registration, Team */

'use strict'

module.exports = {
  // { event: ID, name: STR, nameCht: STR, rules: STR }
  create: function (req, res) {
    Group.create(req.body)
      .then(function (modelData) {
        return res.ok({group: modelData})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  getInfo: function (req, res) {
    var result = {}
    var groupId = parseInt(req.params.id)

    Group.findOne({id: groupId}).populate('races')
      .then(function (modelData) {
        result = modelData.toJSON()
        return Team.find({})
      })
      .then(function (V) {
        result.teams = V
        return Registration.find({group: groupId}).populate('racer')
      })
      .then(function (V) {
        result.registrations = V.map(function (reg) {
          return {
            raceNumber: reg.raceNumber,
            racer: {id: reg.racer.id, firstName: reg.racer.firstName, lastName: reg.racer.lastName, nickName: reg.racer.nickName, team: reg.racer.team}
          }
        })
        return res.ok({group: result})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // /id
  delete: function (req, res) {
    var query = {id: parseInt(req.params.id)}

    Group.findOne(query).populate('races').populate('registrations')
      .then(function (V) {
        if (V.races.length > 0) {
          throw new Error('Cannot delete group that contains races')
        }
        if (V.registrations.length > 0) {
          throw new Error('Cannot delete group that has racers registered')
        }
        return Group.destroy(query)
      })
      .then(function () {
        return res.ok({group: query.id})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // {id: ID, name: STR, nameCht: STR, racerNumberAllowed: INT, rules: ARRAY}
  update: function (req, res) {
    var input = req.body
    var fields = ['name', 'nameCht', 'racerNumberAllowed', 'rules']
    var updateObj = dataService.returnUpdateObj(fields, input)

    Group.update({id: parseInt(input.id)}, updateObj)
      .then(function (modelData) {
        return res.ok({group: modelData[0]})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  }
}
