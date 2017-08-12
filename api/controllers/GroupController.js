/* global dataService, Group, Race, Registration */

'use strict'

module.exports = {
  // { event: ID, name: STR, nameCht: STR, rules: STR }
  create: function (req, res) {
    Group.create(req.body)
    .then(function (modelData) { return res.ok({group: modelData}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  getInfo: function (req, res) {
    var result = {}
    var groupId = req.params.id

    Group.findOne({id: groupId})
    .then(function (modelData) {
      result = modelData.toJSON()
      return Registration.find({group: groupId}).sort('raceNumber ASC').populate('racer').populate('races')
    })
    .then(function (V) {
      result.registrations = V
      return Race.find({group: groupId}).populate('registrations')
    })
    .then(function (V) {
      result.races = V
      return res.ok({group: result})
    })
    .catch(function (E) {
      return res.badRequest(E)
    })
  },
  // /id
  delete: function (req, res) {
    var query = {id: req.params.id}

    Group.findOne(query).populate('races').populate('registrations')
    .then(function (V) {
      if (V.races.length > 0) { throw new Error('Cannot delete group that contains races') }
      if (V.registrations.length > 0) { throw new Error('Cannot delete group that has racers registered') }
      return Group.destroy(query)
    })
    .then(function () { return res.ok({group: query.id}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, name: STR, nameCht: STR, racerNumberAllowed: INT, rules: ARRAY}
  update: function (req, res) {
    var input = req.body
    var fields = ['name', 'nameCht', 'racerNumberAllowed', 'rules']
    var updateObj = dataService.returnUpdateObj(fields, input)

    Group.update({id: input.id}, updateObj)
    .then(function (modelData) { return res.ok({group: modelData[0]}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // query. E.g. { event: ID }
  getGroups: function (req, res) {
    Group.find(req.body)
    .then(function (V) { return res.ok({ groups: V }) })
    .catch(function (E) { return res.badRequest(E) })
  }
}
