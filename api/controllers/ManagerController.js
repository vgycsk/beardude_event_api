/* global accountService, dataService, Manager */

'use strict';

module.exports = {
    activate: function (req, res) {
        return accountService.activate(req, res, 'Manager');
    },
    create: function (req, res) {
        var input = req.body;

        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password mismatch');
        }
        return accountService.create(input, 'Manager')
        .then(function (result) {
            return res.ok({
                message: 'Account created',
                manager: result
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
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
    // Login and keep account info in session
    login: function (req, res) {
        var input = req.body;
        var modelDataObj;

        if (req.session.managerInfo) {
            return res.badRequest('Already logged in');
        }
        return Manager.findOne({
            email: input.email
        })
        .populate('address')
        .populate('events')
        .then(function (modelData) {
            modelDataObj = modelData;
            return dataService.authenticate(input.password, modelDataObj.password);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('Credentials incorrect');
            }
            req.session.managerInfo = modelDataObj;
            return res.ok({
                message: 'Logged in',
                email: modelDataObj.email
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
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
