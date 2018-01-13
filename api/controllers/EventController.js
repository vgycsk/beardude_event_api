/* global dataService, Event, Group, Race, Registration, sails */

'use strict'

var moment = require('moment')

module.exports = {
  // input: { name: STR, nameCht: STR, startTime: DATETIME, endTime: DATETIME, lapDistance: INT, location: STR }, output: { event: {} }
  create: function (req, res) {
    var input = req.body
    input.managerIds = [req.session.managerInfo.id]
    input.uniqueName = dataService.sluggify(input.name)
    input.startTime = moment(input.startTime).valueOf()
    input.endTime = moment(input.endTime).valueOf()
    if (input.streamingStart) { input.streamingStart = moment(input.streamingStart).valueOf() }
    Event.create(input)
    .then(function (V) { return res.ok({ event: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: /:uniqueName  output: { event: {}, groups: [], races: [], registrations: [] }
  getInfo: function (req, res) {
    var result = {}
    var query
    Event.findOne({ uniqueName: req.params.uniqueName })
    .then(function (V) {
      if (!V) { throw new Error('Not found') }
      // Hide event if event is not public and request is not from manager
      if (!V.isPublic) {
        if (!req.session.managerInfo) { return false }
        if (!req.session.managerInfo.id) { return false }
      }
      query = { event: V.id }
      result.event = V
      return Group.find(query)
    })
    .then(function (V) {
      if (!V) { return false }
      result.groups = V
      return Race.find(query)
    })
    .then(function (V) {
      if (!V) { return false }
      result.races = dataService.returnRacesByOrder(V, result.event.raceOrder)
      return Registration.find(query)
    })
    .then(function (V) {
      if (!V) { return false }
      result.registrations = V
      return System.findOne({ key: 0 })
    })
    .then(function (V) {
      result.system = V
      return res.ok(result)
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: na, output: { events: [] }
  getEvents: function (req, res) {
    Event.find({})
    .then(function (V) {
      if (req.session.managerInfo && req.session.managerInfo) {
        return res.ok({ events: V })
      }
      var filteredResults = V.filter(function (eventData) {
        return (eventData.isPublic)
      })
      return res.ok({ events: filteredResults })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID}, output: { event: {} }
  update: function (req, res) {
    var input = req.body
    var fields = [
      'name',
      'nameCht',
      'startTime',
      'endTime',
      'lapDistance',
      'location',
      'raceOrder',
      'isPublic',
      'isRegistrationOpen',
      'isIndieEvent',
      'streamingIframe',
      'streamingStart',
      'rules',
      'registerDesc',
      'announcement'
    ]
    var updateObj = dataService.returnUpdateObj(fields, input)
    if (updateObj.startTime) { updateObj.startTime = moment(updateObj.startTime).valueOf() }
    if (updateObj.endTime) { updateObj.endTime = moment(updateObj.endTime).valueOf() }
    if (updateObj.streamingStart) { updateObj.streamingStart = moment(updateObj.streamingStart).valueOf() }
    if (updateObj.name) { updateObj.uniqueName = dataService.sluggify(updateObj.name) }
    var eventObj
    Event.update({ id: input.id }, updateObj)
    .then(function (V) {
      eventObj = V[0]
      if (input.uniqueName) {
        return Event.count({ uniqueName: input.uniqueName })
      }
      return false
    })
    .then(function (eventLen) {
      if (eventLen && eventLen === 0) {
        return Event.update({ id: input.id }, { uniqueName: input.uniqueName })
      }
      return false
    })
    .then(function (V) {
      if (V) { eventObj = V[0] }
      if (req.body.resultLatency) {
        return System.update({ key: 0 }, { resultLatency: req.body.resultLatency })
      }
      return false
    })
    .then(function (systemData) {
      if (systemData) {
        sails.sockets.broadcast('rxdata', 'eventlatencyupdate', { system: systemData[0] })
      }
      return res.ok({ event: eventObj })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: /:id, output: { event: { id: ID } }
  delete: function (req, res) {
    Event.findOne({ id: req.params.id })
    .then(function (V) {
      var now = moment().valueOf()
      if (now > V.startTime && now < V.endTime) { throw new Error('Cannot delete an ongoing event') }
      return Group.count({ event: req.params.id })
    })
    .then(function (groupLen) {
      if (groupLen > 0) { throw new Error('Cannot delete an event that contains group') }
      return Event.destroy({ id: req.params.id })
    })
    .then(function () { return res.ok({ event: { id: req.params.id } }) })
    .catch(function (E) { return res.badRequest(E) })
  }
}
