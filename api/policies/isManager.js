
'use strict';

// Loosly check if logged in
module.exports = function (req, res, callback) {
    if (req.session.managerInfo && req.session.managerInfo.email) {
        return callback();
    }
    return res.forbidden('Login required');
};
