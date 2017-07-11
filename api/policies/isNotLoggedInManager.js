
'use strict'

module.exports = function (req, res, callback) {
  if (req.session.managerInfo && req.session.managerInfo.email) {
    return res.badRequest('Already logged in')
  }
  return callback()
}
