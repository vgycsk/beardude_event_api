
'use strict';

module.exports = function (req, res, callback) {
    if (req.session.managerInfo && req.session.managerInfo.id === req.params.id) {
        return callback();
    }
    return res.forbidden('Unauthorized');
};
