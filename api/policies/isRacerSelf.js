
'use strict'

module.exports = function (req, res, callback) {
  if (req.session.racerInfo && req.session.racerInfo.id === req.body.id) {
    return callback()
  }
  return res.forbidden('Unauthorized')
}
