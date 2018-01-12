/* global dataService, Group, Race, Registration */

'use strict'

module.exports = {
  // input: { event: ID, name: STR, nameCht: STR, rules: STR }, output: { group: {}}
  create: function (req, res) {
    Group.create(req.body)
    .then(function (modelData) { return res.ok({ group: modelData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: /:id, output: { group: { id: ID }}
  delete: function (req, res) {
    var groupId = req.params.id
    Race.count({ group: groupId })
    .then(function (raceCount) {
      if (raceCount > 0) { throw new Error('Cannot delete group that contains races') }
      return Registration.count({ group: groupId })
    })
    .then(function (regCount) {
      if (regCount > 0) { throw new Error('Cannot delete group that has racers registered') }
      return Group.destroy({ id: groupId })
    })
    .then(function () { return res.ok({ group: { id: groupId } }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // input: { id: ID, name: STR, nameCht: STR, racerNumberAllowed: INT, rules: ARRAY }, output: { group: {} }
  update: function (req, res) {
    var fields = [
      'name',
      'nameCht',
      'racerNumberAllowed',
      'rules'
    ]
    var updateObj = dataService.returnUpdateObj(fields, req.body)
    Group.update({id: req.body.id}, updateObj)
    .then(function (modelData) { return res.ok({group: modelData[0]}) })
    .catch(function (E) { return res.badRequest(E) })
  }
}
