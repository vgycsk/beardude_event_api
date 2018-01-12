/* global dataService, Racer */

'use strict'

var randomstring = require('randomstring')
var codeLength = 36

module.exports = {
  // input ?token=STRING, { id: ID, password: str, confirmPassword: str }
  activate: function (req, res) {
    var input = req.body
    var token = req.params.token
    if (input.password !== input.confirmPassword) {
      return res.badRequest('Password and confirm-password mismatch')
    }
    Racer.findOne({ input: input.id })
    .then(function (V) {
      if (V.autoToken !== token) { throw new Error('Token incorrect') }
      return Racer.update({ id: input.id }, { password: input.password, authToken: '' })
    })
    .then(function (V) {
      req.session.racerInfo = V[0]
      return res.ok({ racer: V[0] })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  create: function (req, res) {
    var input = req.body

    if (input.password) {
      if (input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    } else {
      input.autoToken = randomstring.generate({ length: codeLength })
    }
    return Racer.create(input)
    .then(function (result) { return res.ok({ racer: result.toJSON() }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // Get insensitive account info
  getGeneralInfo: function (req, res) {
    Racer.findOne({ id: req.params.id })
    .then(function (V) { return res.ok({ racer: V.toJSON() }) })
    .catch(function (E) { return res.badRequest(E) })
  },
    // Get complete account info
  getManagementInfo: function (req, res) {
    Racer.findOne({id: req.params.id})
    .then(function (V) { return res.ok({ racer: V }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  getRacers: function (req, res) {
    Racer.find({})
    .then(function (V) { return res.ok({ racers: V.map(function (racer) { return racer.toJSON() }) }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  login: function (req, res) {
    var input = req.body
    var result

    if (req.session.racerInfo) {
      return res.badRequest('Already logged in')
    }
    return Racer.findOne({ email: input.email })
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
  // Update fields speficied in returnUpdateFields function
  update: function (req, res) {
    var input = req.body
    var fields = [
      'email',
      'phone',
      'firstName',
      'lastName',
      'nickName',
      'isLeaderOf',
      'password'
    ]
    var updateObj = dataService.returnUpdateObj(fields, input)

    if (input.password && input.password !== input.confirmPassword) {
      return res.badRequest('Password and confirm-password mismatch')
    }
    Racer.findOne({ id: input.id })
    .then(function (V) { return Racer.update({id: input.id}, updateObj) })
    .then(function () { return Racer.findOne({id: input.id}) })
    .then(function (V) { return res.ok({racer: V.toJSON()}) })
    .catch(function (E) { return res.badRequest(E) })
  }
}
