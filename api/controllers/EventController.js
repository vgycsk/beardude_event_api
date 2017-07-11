/* global _, dataService, Event, Group, Race */

'use strict'

var moment = require('moment')
var Q = require('q')

module.exports = {
  // {name: STR, nameCht: STR, assignedRaceNumber: INT, startTime: DATETIME, endTime: DATETIME, lapDistance: INT, location: STR}
  create: function (req, res) {
    var input = req.body
    var resultObj

    input.startTime = moment(input.startTime).valueOf()
    input.endTime = moment(input.endTime).valueOf()
    Event.create(input)
      .then(function (V) {
        resultObj = V
        return Event.findOne({ id: V.id }).populate('managers')
      })
      .then(function (V) {
        V.managers.add(req.session.managerInfo.id)
        return V.save()
      })
      .then(function () {
        return res.ok({event: resultObj})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  getEvents: function (req, res) {
    Event.find({})
      .then(function (V) {
        return res.ok({events: V})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  getGeneralInfo: function (req, res) {
    Event.findOne({id: parseInt(req.params.id)})
      .populate('groups')
      .then(function (V) {
        return res.ok({event: V})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  getManagementInfo: function (req, res) {
    var eventId = parseInt(req.params.id)
    var result

    Event.findOne({
      id: eventId
    })
      .then(function (V) {
        result = V.toJSON()
        return Group.find({event: eventId}).populate('registrations')
      })
      .then(function (V) {
        var funcs = []

        result.groups = V.map(function (group) {
          funcs.push(Race.find({group: group.id}).populate('registrations'))
          return group.toJSON()
        }) || []
        return Q.all(funcs)
      })
      .then(function (V) {
        result.groups = result.groups.map(function (group, I) {
          group.races = V[I]
          return group
        })
        return res.ok({ event: result })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // {id: ID}
  update: function (req, res) {
    var input = req.body
    var updateObj
    var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isRegistrationOpen', 'isTeamRegistrationOpen', 'isPublic']
    var query = {id: parseInt(input.id)}

    Event.findOne(query)
      .then(function (eventData) {
        updateObj = dataService.returnUpdateObj(fields, input, eventData)
        if (updateObj.startTime) {
          updateObj.startTime = moment(updateObj.startTime).valueOf()
        }
        if (updateObj.endTime) {
          updateObj.endTime = moment(updateObj.endTime).valueOf()
        }
        return Event.update(query, updateObj)
      })
      .then(function (V) {
        return res.ok({event: V[0]})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // {event: ID, epc: STR}
  // copy to all races
  assignTesterRfid: function (req, res) {
    var input = req.body
    var testerEpc

    input.race = parseInt(input.event)
    Event.findOne({id: input.event})
      .populate('groups')
      .then(function (modelData) {
        var rfidExist

        testerEpc = modelData.testerEpc
        rfidExist = _.includes(testerEpc, input.epc)
        if (rfidExist) {
          throw new Error('Tester RFID already assigned')
        }
        testerEpc.push(input.epc)
        return Event.update({id: input.event}, {testerEpc: testerEpc})
      })
      .then(function () {
        return res.ok({event: input.event, epc: input.epc})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  delete: function (req, res) {
    var query = { id: parseInt(req.params.id) }

    Event.findOne(query)
      .populate('groups')
      .then(function (V) {
        var now = moment().valueOf()

        if (V.isPublic) {
          throw new Error('Cannot delete a public event')
        }
        if (now > V.startTime && now < V.endTime) {
          throw new Error('Cannot delete an ongoing event')
        }
        if (V.groups.length > 0) {
          throw new Error('Cannot delete an event that contains group')
        }
        return Event.destroy(query)
      })
      .then(function () {
        return res.ok({event: query.id})
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  }
}
