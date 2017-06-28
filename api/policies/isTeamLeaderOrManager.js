/* global Manager */

'use strict';

module.exports = function (req, res, callback) {
    if (req.session.racerInfo) {
        if (req.session.racerInfo.team && (req.session.racerInfo.id === req.session.racerInfo.team.leader)) {
            return callback();
        }
    } else if (req.session.managerInfo && req.session.managerInfo.email) {
        return Manager.findOne({
            email: req.session.managerInfo.email
        })
        .then(function (managerData) {
            if (typeof managerData !== 'undefined' && managerData.isActive) {
                return callback();
            }
            return res.forbidden('Unauthorized');
        });
    }
    return res.forbidden('Login required');
};
