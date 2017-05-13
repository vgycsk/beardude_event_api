/* eslint-disable no-console */
/* global accountService */

'use strict';

module.exports = {
    // Activate manager by setting password and change isActive
    activate: function (req, res) {
        return accountService.activate(req, res, 'Manager');
    },
    create: function (req, res) {
        return accountService.create(req, res, 'Manager');
    },
    getGeneralInfo: function (req, res) {
        return accountService.getGeneralInfo(req, res, 'Manager');
    },
    getManagementInfo: function (req, res) {
        return accountService.getManagementInfo(req, res, 'Manager');
    },
    login: function (req, res) {
        return accountService.login(req, res, 'Manager');
    },
    logout: function (req, res) {
        delete res.session.managerInfo;
        return res.ok('Logged out');
    },
    reissuePassword: function (req, res) {
        return accountService.reissuePassword(req, res, 'Manager');
    },
    update: function (req, res) {
        return accountService.update(req, res, 'Manager');
    },
    updatePassword: function (req, res) {
        return accountService.updatePassword(req, res, 'Manager');
    }
};
