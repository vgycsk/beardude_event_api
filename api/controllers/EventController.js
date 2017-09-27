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
      if (!V) { return res.notFound() }
      result.registrations = V
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
        return (eventData.isPublic && !eventData.isIndieEvent)
      })
      return res.ok({ events: filteredResults })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: {id: ID}, output: { event: {} }
  update: function (req, res) {
    var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isRegistrationOpen', 'isPublic', 'isIndieEvent', 'requiresPaymentOnReg', 'pacerEpc', 'raceOrder', 'ongoingRace', 'resultLatency', 'validIntervalMs', 'streamingIframe', 'rules', 'streamingStart', 'promoVideo', 'registerDesc']
    var updateObj = dataService.returnUpdateObj(fields, req.body)
    if (updateObj.startTime) { updateObj.startTime = moment(updateObj.startTime).valueOf() }
    if (updateObj.endTime) { updateObj.endTime = moment(updateObj.endTime).valueOf() }
    if (updateObj.streamingStart) { updateObj.streamingStart = moment(updateObj.streamingStart).valueOf() }
    if (updateObj.name) { updateObj.uniqueName = dataService.sluggify(updateObj.name) }
    Event.update({ id: req.body.id }, updateObj)
    .then(function (V) {
      if (updateObj.resultLatency) {
        sails.sockets.broadcast('rxdata', 'eventlatencyupdate', { event: {resultLatency: V[0].resultLatency} })
      }
      return res.ok({ event: V[0] })
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
