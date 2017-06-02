
'use strict';

module.exports = {
    adminPage: function (req, res) {
        return res.render('console');
    },
    adminLoginPage: function (req, res) {
        return res.view('adminLogin');
    }
};
