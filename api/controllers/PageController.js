'use strict';

module.exports = {
    apiTestPage: function (req, res) {
        var params = {};

        return res.render('test', params);
    }
};
