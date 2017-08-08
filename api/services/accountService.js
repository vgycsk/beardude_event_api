/* global dataService, Manager, Racer */

'use strict'

var Q = require('q')
var randomstring = require('randomstring')
var returnModelObj = function (modelName) {
  if (modelName === 'Manager') { return Manager }
  return Racer
}
var returnSessionObj = function (req, modelName) {
  if (modelName === 'Manager') { return req.session.managerInfo }
  return req.session.racerInfo
}

module.exports = {
  // Activate account by setting user-input password, and set isActive=true
  activate: function (req, res, modelName) {
    var input = req.body
    var ModelObj = returnModelObj(modelName)
    var sessionObj = returnSessionObj(req, modelName)

    if (input.password === '') { return res.badRequest('Please enter password') }
    if (input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    if (!sessionObj) { return res.badRequest('Please login') }
    return ModelObj.update({ email: sessionObj.email }, { password: input.password, isActive: true })
      .then(function (modelData) {
        if (modelName === 'Manager') {
          req.session.managerInfo = modelData[0]
        } else {
          req.session.racerInfo = modelData[0]
        }
        return res.ok({ message: 'Account activated', email: sessionObj.email })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
    // Create account. When omitting password, set account inactive and require user to activate
  create: function (inputRaw, modelName) {
    var modelDataObj
    var returnPassword
    var ModelObj = returnModelObj(modelName)
    var q = Q.defer()
    var i
    var input = {}

    for (i in inputRaw) {
      if (inputRaw.hasOwnProperty(i) && inputRaw[i] !== '') {
        input[i] = inputRaw[i]
      }
    }
    if (input.password) {
      delete input.confirmPassword
      input.isActive = true
    } else {
      // TO DO: send email and notify temp password
      input.password = randomstring.generate()
      input.isActive = false
      returnPassword = true
    }
    ModelObj.findOne({ email: input.email })
      .then(function (modelData) {
        if (typeof modelData !== 'undefined') { throw new Error('Account exists') }
        return ModelObj.create(input)
      })
      .then(function (modelData) {
        modelDataObj = modelData
        if (returnPassword) {
          modelDataObj.password = input.password
        } else {
          delete modelDataObj.password
        }
        return q.resolve(modelDataObj)
      })
      .catch(function (E) {
        return q.reject(E)
      })
    return q.promise
  },
  // Reissue password to inactive account
  reissuePassword: function (req, res, modelName) {
    var input = req.params
    var newPassword
    var ModelObj = returnModelObj(modelName)

    ModelObj.findOne({ id: input.id })
      .then(function (modelData) {
        if (modelData.isActive) { throw new Error('Cannot reissue password to activated account') }
        newPassword = randomstring.generate()
        return ModelObj.update({ id: input.id }, { password: newPassword })
      })
      .then(function () {
          // To Do: send temporary password through email
        return res.ok({ message: 'Temporary password created', password: newPassword })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // Update account password
  updatePassword: function (req, res, modelName) {
    var input = req.body
    var ModelObj = returnModelObj(modelName)
    var sessionObj = returnSessionObj(req, modelName)

    if (input.password === '') { return res.badRequest('Empty password') }
    if (input.password !== input.confirmPassword) { return res.badRequest('Password and confirm-password mismatch') }
    if (input.oldPassword === input.password) { return res.badRequest('Password unchanged') }
    return ModelObj.findOne({ id: sessionObj.id })
      .then(function (modelData) {
        return dataService.authenticate(input.oldPassword, modelData.password)
      })
      .then(function (authenticated) {
        if (!authenticated) { throw new Error('Old password incorrect') }
        return ModelObj.update({ id: input.id }, { password: input.password })
      })
      .then(function () {
        return res.ok({ message: 'Password updated' })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  }
}
