/* global Manager, Racer */

'use strict';

module.exports = function (req, res, callback) {
    if (req.session.managerInfo && req.session.managerInfo.email) {
        return Manager.findOne({
            email: req.session.managerInfo.email
        })
        .then(function (managerData) {
            if (typeof managerData !== 'undefined') {
                return callback();
            }
            return res.forbidden('Login required');
        });
    } else if (req.session.racerInfo && req.session.racerInfo.email) {
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
