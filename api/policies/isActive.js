
'use strict';

module.exports = function (req, res, callback) {
    if (req.session.managerInfo) {
        if (req.session.managerInfo.isActive) {
            return callback();
        }
        return res.forbidden('Please activate account');
    } else if (req.session.racerInfo) {
        if (req.session.racerInfo.isActive) {
            return callback();
        }
        return res.forbidden('Please activate account');
    }
    return callback();
};
