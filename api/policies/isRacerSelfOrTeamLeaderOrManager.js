/* global Manager, Racer */

'use strict'

module.exports = function (req, res, callback) {
  if (req.session.racerInfo && req.session.racerInfo.id === req.body.id) {
    return callback()
  }
  if (req.session.racerInfo && req.session.racerInfo.isLeaderOf && req.body.id) {
    return Racer.findOne({ id: req.body.id })
    .then(function (V) {
      if (V.team === req.session.racerInfo.isLeaderOf) {
        return callback()
      }
      return res.forbidden('Unauthorized')
    })
  }
  if (req.session.managerInfo && req.session.managerInfo.email) {
    return Manager.findOne({ email: req.session.managerInfo.email })
      .then(function (managerData) {
        if (typeof managerData !== 'undefined' && managerData.isActive) {
          return callback()
        }
        return res.forbidden('Unauthorized')
      })
  }
  return res.forbidden('Unauthorized')
}
