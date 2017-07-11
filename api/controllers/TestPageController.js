/* global Event, Group, Manager, Race, Racer, Registration */
'use strict'

var moment = require('moment')
var Q = require('q')
var returnParams = function (session) {
  var q = Q.defer()
  var params = {
    session: session
  }

  Event.find({})
    .populate('managers')
    .populate('groups')
    .then(function (eventData) {
      params.events = eventData
      return Manager.find({})
        .populate('events')
    })
    .then(function (managerData) {
      params.managers = managerData
      return Racer.find({})
    })
    .then(function (racerData) {
      params.racers = racerData
      return Group.find({})
        .populate('registrations')
        .populate('races')
    })
    .then(function (groupData) {
      params.groups = groupData
      return Registration.find({})
    })
    .then(function (regData) {
      params.registrations = regData
      return Race.find({})
    })
    .then(function (raceData) {
      params.races = raceData
      return q.resolve(params)
    })
    .catch(function (E) {
      return q.reject('Broken: ', E)
    })
  return q.promise
}

module.exports = {
  apiTestPage: function (req, res) {
    returnParams(req.session)
        .then(function (params) {
          return res.render('testPages/index', {
            params: params
          })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
  },
  eventUpdatePage: function (req, res) {
    returnParams(req.session)
        .then(function (params) {
          var inputId = parseInt(req.params.id)
          var eventToUpdate

          params.events.forEach(function (event) {
            if (event.id === inputId) {
              eventToUpdate = event
            }
          })
          eventToUpdate.startTime = moment(eventToUpdate.startTime).format()
          eventToUpdate.endTime = moment(eventToUpdate.endTime).format()
          return res.render('testPages/eventUpdate', {
            event: eventToUpdate,
            params: params
          })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
  },
  raceUpdatePage: function (req, res) {
    returnParams(req.session)
        .then(function (params) {
          var inputId = parseInt(req.params.id)
          var raceToUpdate

          params.races.forEach(function (race) {
            if (race.id === inputId) {
              raceToUpdate = race
            }
          })
          return res.render('testPages/raceUpdate', {
            race: raceToUpdate,
            params: params
          })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
  },
  teamUpdatePage: function (req, res) {
    returnParams(req.session)
        .then(function (params) {
          var inputId = parseInt(req.params.id)
          var teamToUpdate

          params.teams.forEach(function (team) {
            if (team.id === inputId) {
              teamToUpdate = team
            }
          })
          return res.render('testPages/teamUpdate', {
            team: teamToUpdate,
            params: params
          })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
  },
  groupUpdatePage: function (req, res) {
    returnParams(req.session)
        .then(function (params) {
          var inputId = parseInt(req.params.id)
          var groupToUpdate

          params.groups.forEach(function (group) {
            if (group.id === inputId) {
              groupToUpdate = group
            }
          })
          return res.render('testPages/groupUpdate', {
            group: groupToUpdate,
            params: params
          })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
  },
  managerUpdatePage: function (req, res) {
    returnParams(req.session)
        .then(function (params) {
          var inputId = parseInt(req.params.id)
          var managerToUpdate

          params.managers.forEach(function (manager) {
            if (manager.id === inputId) {
              managerToUpdate = manager
            }
          })
          return res.render('testPages/managerUpdate', {
            manager: managerToUpdate,
            params: params
          })
        })
        .catch(function (E) {
          return res.badRequest(E)
        })
  }
}
