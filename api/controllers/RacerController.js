/* eslint-disable no-console */
/* global accountService */

'use strict';

module.exports = {
    // Activate racer by setting password and change isActive
    activate: function (req, res) {
        return accountService.activate(req, res, 'Racer');
    },
    create: function (req, res) {
        return accountService.create(req, res, 'Racer');
    },
    getGeneralInfo: function (req, res) {
        return accountService.getGeneralInfo(req, res, 'Racer');
    },
    getManagementInfo: function (req, res) {
        return accountService.getManagementInfo(req, res, 'Racer');

    },
    login: function (req, res) {
        return accountService.login(req, res, 'Racer');
    },
    logout: function (req, res) {
        delete res.session.racerInfo;
        return res.ok('Logged out');
    },
    update: function (req, res) {
        return accountService.update(req, res, 'Racer');
    },
    updatePassword: function (req, res) {
        return accountService.updatePassword(req, res, 'Racer');
    }
};
