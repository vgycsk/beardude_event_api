/* eslint-disable no-console */
/* global Address, dataService, Manager, Racer */

'use strict';

var randomstring = require('randomstring');
var returnModelObj = function (modelName) {
    if (modelName === 'Manager') {
        return Manager;
    }
    return Racer;
};
var returnSessionObj = function (req, modelName) {
    if (modelName === 'Manager') {
        return req.ression.managerInfo;
    }
    return req.ression.racerInfo;
};
var returnUpdateFields = function (modelName) {
    var managerUpdateFields = ['email', 'phone', 'firstName', 'lastName'];
    var racerUpdateFields = ['email', 'phone', 'firstName', 'lastName', 'birthday', 'idNumber'];

    if (modelName === 'Manager') {
        return managerUpdateFields;
    }
    return racerUpdateFields;
};

module.exports = {
    // Activate account by setting user-input password, and set isActive=true
    activate: function (req, res, modelName) {
        var input = req.body;
        var ModelObj = returnModelObj(modelName);
        var sessionObj = returnSessionObj(req, modelName);

        if (input.password === '') {
            return res.badRequest('Password enter password');
        }
        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password mismatch');
        }
        return ModelObj.update({
            email: sessionObj.email
        }, {
            password: input.password,
            isActive: true
        })
        .then(function (modelData) {
            sessionObj = modelData[0];
            return res.ok('Account activated');
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Create account. When omitting password, set account inactive and require user to activate
    create: function (req, res, modelName) {
        var input = req.body;
        var addressInput = input.address;
        var addressDataObj;
        var modelDataObj;
        var returnPassword;
        var ModelObj = returnModelObj(modelName);

        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password mismatch');
        }
        if (input.password === '') {
            input.password = randomstring.generate();
            input.isActive = false;
            returnPassword = true;
        } else {
            input.isActive = true;
        }
        delete input.confirmPassword;
        return ModelObj.findOne({
            email: input.email
        })
        .then(function (modelData) {
            if (typeof modelData !== 'undefined') {
                throw new Error('Account exists');
            }
            delete input.address;
            return ModelObj.create(input);
        })
        .then(function (modelData) {
            modelDataObj = modelData;
            return Address.create(addressInput);
        })
        .then(function (addressData) {
            addressDataObj = addressData;
            return ModelObj.update({
                id: modelDataObj.id
            }, {
                address: addressDataObj.id
            });
        })
        .then(function () {
            modelDataObj.address = addressDataObj;
            if (returnPassword) {
                modelDataObj.password = input.password;
            } else {
                delete modelDataObj.password;
            }
            return res.ok(modelDataObj);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Get insensitive account info
    getGeneralInfo: function (req, res, modelName) {
        var ModelObj = returnModelObj(modelName);

        ModelObj.findOne({
            id: req.params.id
        })
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
    getManagementInfo: function (req, res, modelName) {
        var ModelObj = returnModelObj(modelName);

        ModelObj.findOne({
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
    // Login and keep account info in session
    login: function (req, res, modelName) {
        var input = req.body;
        var ModelObj = returnModelObj(modelName);
        var sessionObj = returnSessionObj(req, modelName);
        var modelDataObj;

        if (sessionObj) {
            return res.ok('Already logged in');
        }
        return ModelObj.findOne({
            email: input.email
        })
        .populate('address')
        .populate('events')
        .populate('races')
        .then(function (modelData) {
            modelDataObj = modelData;
            return dataService.authenticate(input.password, modelDataObj.password);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('User credentials incorrect');
            }
            sessionObj = modelDataObj;
            return res.ok({
                email: modelDataObj.email
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Reissue password to inactive account
    reissuePassword: function (req, res, modelName) {
        var input = req.params;
        var newPassword;
        var ModelObj = returnModelObj(modelName);

        ModelObj.findOne({
            id: input.id
        })
        .then(function (modelData) {
            if (modelData.isActive) {
                throw new Error('Cannot reissue password to activated account');
            }
            newPassword = randomstring.generate();
            return ModelObj.update({
                id: input.id
            }, {
                password: newPassword
            });
        })
        .then(function () {
            var result = {
                id: input.id,
                password: newPassword
            };

            // To Do: send temporary password through email
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Update fields speficied in returnUpdateFields function
    update: function (req, res, modelName) {
        var input = req.body;
        var addressObj = input.address;
        var updateObj = {};
        var resultObj = input;
        var ModelObj = returnModelObj(modelName);
        var fields = returnUpdateFields(modelName);

        ModelObj.findOne({
            id: parseInt(input.id)
        })
        .then(function (modelData) {
            updateObj = dataService.returnUpdateObj(fields, input, modelData);
            if (updateObj) {
                return ModelObj.update({
                    id: input.id
                }, updateObj);
            }
            return false;
        })
        .then(function (modelData) {
            if (modelData) {
                resultObj = modelData[0];
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
    },
    // Update account password
    updatePassword: function (req, res, modelName) {
        var input = req.body;
        var ModelObj = returnModelObj(modelName);

        if (input.password === '') {
            return res.badRequest('Empty password');
        }
        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password mismatch');
        }
        return ModelObj.update({
            id: input.id
        }, {
            password: input.password
        })
        .then(function () {
            return res.ok('Password updated');
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
