/* global accountService, dataService, Manager */

'use strict'

module.exports = {
  create: function (req, res) {
    var input = req.body
    if (input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    return accountService.create(input, 'Manager')
    .then(function (result) { return res.ok({manager: result}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  getAccountInfo: function (req, res) {
    return res.ok({manager: req.session.managerInfo})
  },
  getGeneralInfo: function (req, res) {
    Manager.findOne({id: req.params.id})
    .then(function (V) { return res.ok({manager: {firstName: V.firstName, lastName: V.lastName, isActive: V.isActive}}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  getManagers: function (req, res) {
    Manager.find({})
    .then(function (V) { return res.ok({managers: V.map(function (obj) { return obj.toJSON() })}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  getManagementInfo: function (req, res) {
    Manager.findOne({id: req.params.id})
    .then(function (V) { return res.ok({manager: V.toJSON()}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  login: function (req, res) {
    var input = req.body
    var result
    if (input.email === '' || input.password === '') {
      return res.badRequest('Please enter valid credentials')
    }
    return Manager.findOne({email: input.email})
    .then(function (V) {
      if (!V) { throw new Error('User not found') }
      result = V
      return dataService.authenticate(input.password, V.password)
    })
    .then(function (authenticated) {
      if (!authenticated) { throw new Error('Credentials incorrect') }
      delete result.password
      req.session.managerInfo = result
      return res.ok({manager: result})
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  logout: function (req, res) {
    delete req.session.managerInfo
    return res.ok({message: 'Logged out'})
  },
  update: function (req, res) {
    var input = req.body
    var fields = ['email', 'phone', 'firstName', 'lastName', 'password', 'street', 'district', 'city', 'county', 'country', 'zip', 'isActive']
    var query = {id: input.id}
    var updateObj = dataService.returnUpdateObj(fields, input)
    if (input.password && input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    return Manager.update(query, updateObj)
    .then(function (V) { return res.ok({manager: V[0].toJSON()}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  updatePassword: function (req, res) {
    return accountService.updatePassword(req, res, 'Manager')
  }
}
