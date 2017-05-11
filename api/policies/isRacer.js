/* global Racer */

'use strict';

module.exports = function (req, res, callback) {
    if (req.session.racerInfo && req.session.RacerInfo.email) {
        return Racer.findOne({
            email: req.session.racerInfo.email
        })
        .then(function (racerData) {
            if (typeof racerData !== 'undefined') {
                return callback();
            }
            return res.forbidden('Login required');
        });
    }
    return res.forbidden('Login required');
};
