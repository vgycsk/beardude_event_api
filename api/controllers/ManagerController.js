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
                manager: result
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getAccountInfo: function (req, res) {
        return res.ok({
            manager: req.session.managerInfo
        });
    },
    // Get insensitive account info
    getGeneralInfo: function (req, res) {
        Manager.findOne({
            id: req.params.id
        })
//        .populate('events')
        .then(function (modelData) {
            return res.ok({
              manager: {
                firstName: modelData.firstName,
                lastName: modelData.lastName,
                isActive: modelData.isActive
              }
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getManagers: function (req, res) {
        Manager.find({})
        .then(function (modelData) {
            var result = modelData.map(function (obj) {
                return obj.toJSON();
            });

            return res.ok({
                managers: result
            });
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
//        .populate('events')
        .then(function (modelData) {
            return res.ok({
              manager: modelData.toJSON()
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Login and keep account info in session
    login: function (req, res) {
        var input = req.body;
        var modelDataObj;

        if (input.email === '' || input.password === '') {
            return res.badRequest('Please enter valid credentials');
        }
        return Manager.findOne({
            email: input.email
        })
//        .populate('events')
        .then(function (modelData) {
            modelDataObj = modelData;
            return dataService.authenticate(input.password, modelDataObj.password);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('Credentials incorrect');
            }
            delete modelDataObj.password;
            req.session.managerInfo = modelDataObj;
            return res.ok({
                manager: modelDataObj
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
    // Update fields speficied in returnUpdateFields function
    update: function (req, res, modelName) {
        var input = req.body;
        var updateObj = {};
        var resultObj;
        var fields = ['email', 'phone', 'firstName', 'lastName', 'password', 'street', 'district', 'city', 'county', 'country', 'zip', 'isActive'];

        Manager.findOne({
            id: parseInt(input.id)
        })
        .then(function (modelData) {
            var updateObj = {};
            var toUpdate;

            if (input.password && input.password !== input.confirmPassword) {
                return res.badRequest('Password and confirm-password mismatch');
            }
            fields.forEach(function (field) {
              if (typeof input[field] !== 'undefined') {
                  updateObj[field] = input[field];
                  toUpdate = true;
              }
            });
            if (toUpdate) {
                return Manager.update({
                    id: input.id
                }, updateObj);
            }
            return false;
        })
        .then(function (modelData) {
            return Manager.findOne({
                id: input.id
            });
        })
        .then(function (modelData) {
            return res.ok({
              manager: modelData.toJSON()
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    updatePassword: function (req, res) {
        return accountService.updatePassword(req, res, 'Manager');
    }
};
