
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
    }
};

module.exports = pageController;
