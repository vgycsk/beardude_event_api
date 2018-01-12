
'use strict'

module.exports = function (req, res, callback) {
  if (req.session.racerInfo && req.session.racerInfo.isLeaderOf && req.session.racerInfo.isLeaderOf === req.body.id) {
    return callback()
  }
  return res.forbidden('Unauthorized')
}
