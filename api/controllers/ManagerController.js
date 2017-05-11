/* eslint-disable no-console */
/* global dataService, Manager */

'use strict';

var randomstring = require('randomstring');

module.exports = {
    create: function (req, res) {
        var input = req.body;

        Manager.findOne({
            email: input.email
        })
        .then(function (managerData) {
            if (!managerData || managerData.length === 0) {
                // Temporary password
                input.password = 'init';
                input.temporaryPassword = randomstring.generate();
                return Manager.create(input);
            }
            throw new Error('User exists');
        })
        .then(function (managerData) {
            return res.ok(managerData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getGeneralInfo: function (req, res) {
        var query = req.params;

        Manager.findOne(query)
        .then(function (managerData) {
            var result = {
                firstName: managerData.firstName,
                lastName: managerData.lastName,
                isActive: managerData.isActive
            };

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getManagementInfo: function (req, res) {
        var query = req.params;

        Manager.findOne(query)
        .populate('address')
        .populate('events')
        .then(function (managerData) {
            var result = managerData;

            delete result.password;
            delete result.temporaryPassword;
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    login: function (req, res) {
        var input = req.body;
        var managerDataObj;
        var queryObj = {};

        // User already logged in system
        if (req.session.managerInfo) {
            // And already logged in
            return res.ok('Already logged in');
        }
        if (input.email) {
            queryObj = {
                email: input.email
            };
        } else if (input.phone) {
            queryObj = {
                phone: input.phone
            };
        }
        return Manager.findOne(queryObj)
        .then(function (managerData) {
            managerDataObj = managerData;
            return dataService.authenticate(input.password, managerDataObj.password);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('User credentials incorrect');
            }
            req.session.managerInfo = managerDataObj;
            if (managerDataObj.temporaryPassword !== '') {
                // Has temporary password set
                console.log('Previously requested resetting password. Clearing that now');
                return Manager.update({
                    email: managerDataObj.email
                }, {
                    temporaryPassword: ''
                });
            }
            return false;
        })
        .then(function () {
            return res.ok({
                email: managerDataObj.email
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    update: function (req, res) {
        var input = req.body;
        var fields = ['email', 'phone', 'firstName', 'lastName', 'birthday', 'idNumber', 'password', 'isActive'];
        var updateObj = {};

        fields.forEach(function (field) {
            if (input[field]) {
                updateObj[field] = input[field];
            }
        });
        Manager.update({
            id: input.id
        }, updateObj)
        .then(function (managerData) {
            return res.ok(managerData[0]);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
