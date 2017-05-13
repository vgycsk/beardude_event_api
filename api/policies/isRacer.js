
'use strict';

// Loosly check if logged in
module.exports = function (req, res, callback) {
    if (req.session.racerInfo && req.session.RacerInfo.email) {
        return callback();
    }
    return res.forbidden('Login required');
};
