/* eslint-disable no-console */
/* global Address, dataService, Manager */

'use strict';

module.exports = {
    // Activate manager by setting password and change isActive
    activate: function (req, res) {
        var input = req.body;

        if (input.password === '') {
            return res.badRequest('Password enter password');
        }
        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password mismatch');
        }
        return Manager.update({
            email: req.session.managerInfo.email
        }, {
            password: input.password,
            isActive: true
        })
        .then(function (managerData) {
            req.session.managerInfo = managerData[0];
            return res.ok('Account activated');
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    create: function (req, res) {
        var input = req.body;
        var addressInput = JSON.parse(JSON.stringify(input.address));
        var addressDataObj;
        var managerDataObj;

        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password mismatch');
        }
        if (input.password === '') {
            input.password = 'init';
            input.isActive = false;
        } else {
            input.isActive = true;
        }
        return Manager.findOne({
            email: input.email
        })
        .then(function (managerData) {
            if (typeof managerData !== 'undefined') {
                throw new Error('Account exists');
            }
            delete input.address;
            return Manager.create(input);
        })
        .then(function (managerData) {
            managerDataObj = managerData;
            return Address.create(addressInput);
        })
        .then(function (addressData) {
            addressDataObj = addressData;
            return Manager.update({
                id: managerDataObj.id
            }, {
                address: addressDataObj.id
            });
        })
        .then(function () {
            var result = managerDataObj;

            result.address = addressDataObj;
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getGeneralInfo: function (req, res) {
        Manager.findOne({
            id: req.params.id
        })
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
        Manager.findOne({
            id: req.params.id
        })
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

        if (req.session.managerInfo) {
            return res.ok('Already logged in');
        }
        return Manager.findOne({
            email: input.email
        })
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
    logout: function (req, res) {
        delete res.session.managerInfo;
        return res.ok('Logged out');
    },
    update: function (req, res) {
        var input = req.body;
        var fields = ['email', 'phone', 'firstName', 'lastName', 'birthday', 'idNumber', 'password', 'isActive'];
        var addressObj = input.address;
        var updateObj = {};
        var resultObj;
        var toUpdate;

        Manager.findOne({
            id: parseInt(input.id)
        })
        .then(function (managerData) {
            resultObj = input;
            fields.forEach(function (field) {
                if (input[field] && (managerData[field] !== input[field])) {
                    updateObj[field] = input[field];
                    toUpdate = true;
                }
            });
            if (updateObj.password) {
                if (updateObj.password === '') {
                    delete updateObj.password;
                } else if (input.password !== input.confirmPassword) {
                    return res.badRequest('Password and confirm-password mismatch');
                }
            }
            if (toUpdate) {
                return Manager.update({
                    id: input.id
                }, updateObj);
            }
            return false;
        })
        .then(function (managerData) {
            if (managerData) {
                resultObj = managerData[0];
            }
            return Address.update({
                id: addressObj.id
            }, addressObj);
        })
        .then(function (addressData) {
            resultObj.address = addressData[0];
            return res.ok(resultObj);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
