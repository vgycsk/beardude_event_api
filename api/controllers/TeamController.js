/* global dataService, Racer, Team */

'use strict'

var Q = require('q')
var TeamController = {
  // input: {name: STR, desc: STR}
  createTeam: function (input) {
    var q = Q.defer()

    Team.create(input)
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
  // /:ID
  delete: function (req, res) {
    Racer.find({ team: req.params.id })
    .then(function (V) {
      if (V.length > 0) { throw new Error('Cannot delete a team that contains racers') }
      return Team.destroy({ id: req.params.id })
    })
    .then(function () { return res.ok({ team: req.params.id }) })
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
