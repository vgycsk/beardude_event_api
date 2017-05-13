/* global accountService, Racer */

'use strict';

module.exports = {
    activate: function (req, res) {
        return accountService.activate(req, res, 'Racer');
    },
    create: function (req, res) {
        return accountService.create(req, res, 'Racer');
    },
    // Get insensitive account info
    getGeneralInfo: function (req, res) {
        Racer.findOne({
            id: req.params.id
        })
        .populate('events')
        .populate('races')
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
        Racer.findOne({
            id: req.params.id
        })
        .populate('address')
        .populate('events')
        .populate('races')
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
        return accountService.login(req, res, 'Racer');
    },
    logout: function (req, res) {
        delete req.session.racerInfo;
        return res.ok({
            message: 'Logged out'
        });
    },
    reissuePassword: function (req, res) {
        return accountService.reissuePassword(req, res, 'Racer');
    },
    update: function (req, res) {
        return accountService.update(req, res, 'Racer');
    },
    updatePassword: function (req, res) {
        return accountService.updatePassword(req, res, 'Racer');
    }
};
