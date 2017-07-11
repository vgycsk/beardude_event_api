/* global dataService, Team */

'use strict'

var Q = require('q')
var TeamController = {
  // {name: STR}
  nameAvailable: function (req, res) {
    Team.findOne(req.body)
      .then(function (V) {
        return res.ok({ team: V })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // {name: STR, desc: STR, url: STR, leader: ID}
  createTeam: function (input) {
    var q = Q.defer()
    var obj = { name: input.name, nameCht: input.nameCht, description: input.description, url: input.url }

    if (input.leader) {
      obj.leader = input.leader
    }
    Team.create(obj)
      .then(function (teamData) {
        return q.resolve(teamData)
      })
      .catch(function (E) {
        return q.reject(E)
      })
    return q.promise
  },
    // {name: STR, desc: STR, url: STR}
  create: function (req, res) {
    var input = req.body

    if (req.session.racerInfo) {
      input.leader = req.session.racerInfo.id
    }
    TeamController.createTeam(input)
      .then(function (teamData) {
        return res.ok({ team: teamData })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // /:ID
  delete: function (req, res) {
    var query = {id: parseInt(req.params.id)}

    Team.findOne(query).populate('racers')
    .then(function (V) {
      if (V.racers.length > 0) {
        throw new Error('Cannot delete a team that contains racers')
      }
      return Team.destroy(query)
    })
    .then(function () {
      return res.ok({ team: query.id })
    })
    .catch(function (E) {
      return res.badRequest(E)
    })
  },
  getInfo: function (req, res) {
    Team.findOne({ id: parseInt(req.params.id) }).populate('racers')
      .then(function (teamData) {
        return res.ok({ team: teamData })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  getTeams: function (req, res) {
    Team.find({})
      .then(function (teamData) {
        return res.ok({ teams: teamData })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
    // {id: ID}
  update: function (req, res) {
    var input = req.body
    var fields = ['name', 'nameCht', 'description', 'url', 'leader']
    var queryObj = { id: parseInt(input.id) }

    Team.findOne(queryObj)
      .then(function (modelData) {
        return Team.update(queryObj, dataService.returnUpdateObj(fields, input))
      })
      .then(function () {
        return Team.findOne(queryObj).populate('racers')
      })
      .then(function (modelData) {
        input.racers.forEach(function (racer) {
          if (racer.toAdd) {
            modelData.racers.add(racer.id)
          } else if (racer.toRemove) {
            modelData.racers.remove(racer.id)
          }
        })
        return modelData.save()
      })
      .then(function () {
        return Team.findOne(queryObj).populate('racers')
      })
      .then(function (modeldata) {
        return res.ok({ team: modeldata })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  }
  // {id: ID, racer: ID}
  // invite: function (req, res) {},
  // {id: ID, racer: ID}
  // acceptInvitation: function (req, res) {}
}

module.exports = TeamController
