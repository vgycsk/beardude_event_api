
'use strict';

var pageController = {
    adminLandingPage: function (req, res) {
        return res.render('layout', {
            page: 'adminLanding'
        });
    },
    adminLoginPage: function (req, res) {
        return res.render('layout', {
            page: 'adminLogin'
        });
    },
    renderLoginPage: function (res, paramsRaw) {
        var params = {};

        if (typeof paramsRaw !== 'undefined') {
            params = paramsRaw;
        }
        return res.view('adminLogin', params);
    }
};

module.exports = pageController;
