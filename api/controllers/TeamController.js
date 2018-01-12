/* global dataService, Team */

'use strict'

var Q = require('q')
var TeamController = {
  // input: {name: STR, desc: STR}
  createTeam: function (input) {
    var q = Q.defer()
    var isValid = function (name) {
      var qq = Q.defer()
      Team.count({ name: name })
      .then(function (teamLen) {
        if (teamLen === 0) { return q.resolve(true) }
        return q.resolve(false)
      })
      return qq.promise
    }
    var returnName = function (name) {
      var qq = Q.defer()
      var result = name
      var appendix = 0
      isValid(result)
      .then(function (res) {
        if (!res) {
          appendix += 1
          result += ' - ' + appendix
          return isValid(result)
        }
        return q.resolve(result)
      })
      return qq.promise
    }
    returnName(input.name)
    .then(function (teamName) {
      return Team.create({
        name: teamName,
        desc: input.desc
      })
    })
    .then(function (teamData) { return q.resolve(teamData) })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  // input: {name: STR, desc: STR} output: { team: {}}
  create: function (req, res) {
    TeamController.createTeam(req.body)
    .then(function (teamData) { return res.ok({ team: teamData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: /:name  output: { team: {} }
  getInfo: function (req, res) {
    Team.findOne({ id: (req.params.name).toLowerCase().trim() })
    .then(function (V) { return res.ok({ team: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  getTeams: function (req, res) {
    Team.find({})
    .then(function (V) { return res.ok({ teams: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
    // {id: ID, objs: {}}
  update: function (req, res) {
    var input = req.body
    var fields = [
      'name',
      'description'
    ]
    Team.update({ id: input.id }, dataService.returnUpdateObj(fields, input))
    .then(function (V) { return res.ok({ team: V[0] }) })
    .catch(function (E) { return res.badRequest(E) })
  }
}

module.exports = TeamController
