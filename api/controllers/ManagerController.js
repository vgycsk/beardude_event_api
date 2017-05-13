/* global accountService, Manager */

'use strict';

module.exports = {
    activate: function (req, res) {
        return accountService.activate(req, res, 'Manager');
    },
    create: function (req, res) {
        return accountService.create(req, res, 'Manager');
    },
    // Get insensitive account info
    getGeneralInfo: function (req, res) {
        Manager.findOne({
            id: req.params.id
        })
        .populate('events')
        .then(function (modelData) {
            var result = {
                firstName: modelData.firstName,
                lastName: modelData.lastName,
                isActive: modelData.isActive
            };

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Get complete account info
    getManagementInfo: function (req, res) {
        Manager.findOne({
            id: req.params.id
        })
        .populate('address')
        .populate('events')
        .then(function (modelData) {
            var result = modelData;

            delete result.password;
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    login: function (req, res) {
        return accountService.login(req, res, 'Manager');
    },
    logout: function (req, res) {
        delete req.session.managerInfo;
        return res.ok({
            message: 'Logged out'
        });
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
