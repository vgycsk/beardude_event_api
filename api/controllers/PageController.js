
'use strict';

var pageController = {
    adminPage: function (req, res) {
        return res.render('console');
    },
    adminLoginPage: function (req, res) {
        return pageController.renderLoginPage(res);
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
