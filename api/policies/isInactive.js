
'use strict';

module.exports = function (req, res, callback) {
    if (req.session.managerInfo) {
        if (req.session.managerInfo.isActive) {
            return res.forbidden('Already activated');
        }
        return callback();
    } else if (req.session.racerInfo) {
        if (req.session.racerInfo.isActive) {
            return res.forbidden('Already activated');
        }
        return callback();
    }
    return callback();
};
