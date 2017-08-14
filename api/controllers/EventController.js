/* global dataService, Event, Group, Race, Registration */

'use strict'

var moment = require('moment')

module.exports = {
  // {name: STR, nameCht: STR, assignedRaceNumber: INT, startTime: DATETIME, endTime: DATETIME, lapDistance: INT, location: STR}
  create: function (req, res) {
    var input = req.body

    input.uniqueName = dataService.sluggify(input.name)
    input.startTime = moment(input.startTime).valueOf()
    input.endTime = moment(input.endTime).valueOf()
    Event.create(input)
    .then(function (V) { return res.ok({event: V}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  getInfo: function (req, res) {
    var result = {}
    var query
    Event.findOne({ uniqueName: req.params.uniqueName })
    .then(function (V) {
      query = { event: V.id }
      result.event = V
      return Group.find(query)
    })
    .then(function (V) {
      result.groups = V
      return Race.find(query)
    })
    .then(function (V) {
      result.races = V
      return Registration.find(query)
    })
    .then(function (V) {
      result.registrations = V
      return res.ok(result)
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  getEvents: function (req, res) {
    Event.find({})
    .then(function (V) { return res.ok({events: V}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID}
  update: function (req, res) {
    var input = req.body
    var updateObj
    var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isRegistrationOpen', 'isTeamRegistrationOpen', 'isPublic', 'isIndieEvent', 'requiresPaymentOnReg', 'pacerEpc', 'raceOrder', 'ongoingRace']
    var query = {id: input.id}

    Event.findOne(query)
    .then(function (eventData) {
      updateObj = dataService.returnUpdateObj(fields, input)
      if (updateObj.startTime) { updateObj.startTime = moment(updateObj.startTime).valueOf() }
      if (updateObj.endTime) { updateObj.endTime = moment(updateObj.endTime).valueOf() }
      if (updateObj.name) { updateObj.uniqueName = dataService.sluggify(updateObj.name) }
      return false
    })
    .then(function () {
      return Event.update(query, updateObj)
    })
    .then(function (V) { return res.ok({event: V[0]}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  delete: function (req, res) {
    var query = { id: req.params.id }

    Event.findOne(query)
    .then(function (V) {
      var now = moment().valueOf()
      if (V.isPublic) { throw new Error('Cannot delete a public event') }
      if (now > V.startTime && now < V.endTime) { throw new Error('Cannot delete an ongoing event') }
      return Group.count({ event: query.id })
    })
    .then(function (groupLen) {
      if (groupLen > 0) { throw new Error('Cannot delete an event that contains group') }
      return Event.destroy(query)
    })
    .then(function () { return res.ok({ event: query }) })
    .catch(function (E) { return res.badRequest(E) })
  }
}
