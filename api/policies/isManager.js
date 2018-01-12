/* global Manager */

'use strict'

module.exports = function (req, res, callback) {
  if (req.session.managerInfo && req.session.managerInfo.email) {
    return Manager.findOne({ email: req.session.managerInfo.email })
      .then(function (managerData) {
        if (typeof managerData !== 'undefined') {
          return callback()
        }
        return res.forbidden('Unauthorized')
      })
  }
  return res.forbidden('Unauthorized')
}
