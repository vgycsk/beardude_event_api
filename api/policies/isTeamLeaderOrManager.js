/* global Manager */

'use strict'

module.exports = function (req, res, callback) {
  if (req.session.racerInfo && req.session.racerInfo.isLeaderOf && req.session.racerInfo.isLeaderOf === req.body.id) {
    return callback()
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
