/* global Racer */

'use strict'

module.exports = function (req, res, callback) {
  if (req.session.racerInfo && req.session.racerInfo.email) {
    return Racer.findOne({ email: req.session.racerInfo.email })
      .then(function (racerData) {
        if (typeof racerData !== 'undefined' && racerData.isActive) {
          return callback()
        }
        return res.forbidden('Login required or need activation')
      })
  }
  return res.forbidden('Login required')
}
