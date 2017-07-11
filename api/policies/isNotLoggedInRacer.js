
'use strict'

module.exports = function (req, res, callback) {
  if (req.session.racerInfo && req.session.racerInfo.email) {
    return res.forbidden('Already logged in')
  }
  return callback()
}
