/* global accountService, dataService, Racer */

'use strict'

module.exports = {
  activate: function (req, res) {
    return accountService.activate(req, res, 'Racer')
  },
  getRacers: function (req, res) {
    Racer.find({})
    .then(function (V) { return res.ok({ racers: V.map(function (racer) { return racer.toJSON() }) }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  create: function (req, res) {
    var input = req.body
    if (input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    return accountService.create(input, 'Racer')
    .then(function (result) { return res.ok({ racer: result.toJSON() }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // Get insensitive account info
  getGeneralInfo: function (req, res) {
    Racer.findOne({ id: req.params.id }).populate('team')
    .then(function (V) { return res.ok({ racer: {firstName: V.firstName, lastName: V.lastName, isActive: V.isActive, team: V.team} }) })
    .catch(function (E) { return res.badRequest(E) })
  },
    // Get complete account info
  getManagementInfo: function (req, res) {
    Racer.findOne({id: req.params.id}).populate('registrations').populate('team')
    .then(function (modelData) { return res.ok({ racer: modelData.toJSON() }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  login: function (req, res) {
    var input = req.body
    var result

    if (req.session.racerInfo) {
      return res.badRequest('Already logged in')
    }
    return Racer.findOne({ email: input.email }).populate('team')
    .then(function (V) {
      result = V
      return dataService.authenticate(input.password, result.password)
    })
    .then(function (authenticated) {
      if (!authenticated) {
        throw new Error('Credentials incorrect')
      }
      delete result.password
      req.session.racerInfo = result
      return res.ok({ racer: result })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  logout: function (req, res) {
    delete req.session.racerInfo
    return res.ok({ message: 'Logged out' })
  },
  reissuePassword: function (req, res) {
    return accountService.reissuePassword(req, res, 'Racer')
  },
  // Update fields speficied in returnUpdateFields function
  update: function (req, res, modelName) {
    var input = req.body
    var fields = ['email', 'phone', 'firstName', 'lastName', 'nickName', 'birthday', 'idNumber', 'password', 'street', 'district', 'city', 'county', 'country', 'zip', 'isActive']
    var updateObj = dataService.returnUpdateObj(fields, input)

    if (input.password && input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    Racer.update({id: input.id}, updateObj)
    .then(function () {
      return Racer.findOne({id: input.id}).populate('registrations').populate('team')
    })
    .then(function (V) { return res.ok({racer: V.toJSON()}) })
    .catch(function (E) { return res.badRequest(E) })
  },
  updatePassword: function (req, res) {
    return accountService.updatePassword(req, res, 'Racer')
  }
}
