/* eslint-disable no-console */
/* global dataService, Racer */

'use strict';

var randomstring = require('randomstring');

module.exports = {
    create: function (req, res) {
        var input = req.body;

        Racer.find({
            or: [
                {
                    phone: input.phone
                },
                {
                    email: input.email
                }
            ]
        })
        .then(function (racerData) {
            if (!racerData || racerData.length === 0) {
                // Temporary password
                input.password = 'init';
                input.temporaryPassword = randomstring.generate();
                return Racer.create(input);
            }
            throw new Error('racer exists');
        })
        .then(function (racerData) {
            return res.ok(racerData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getGeneralInfo: function (req, res) {
        var query = req.params;

        Racer.findOne(query)
        .then(function (racerData) {
            var result = {
                firstName: racerData.firstName,
                lastName: racerData.lastName,
                isActive: racerData.isActive
            };

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getManagementInfo: function (req, res) {
        var query = req.params;

        Racer.findOne(query)
        .populate('address')
        .populate('events')
        .populate('races')
        .then(function (racerData) {
            var result = racerData;

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
        var racerDataObj;
        var queryObj = {};

        // User already logged in system
        if (req.session.racerInfo) {
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
        return Racer.findOne(queryObj)
        .then(function (racerData) {
            racerDataObj = racerData;
            return dataService.authenticate(input.password, racerDataObj.password);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('User credentials incorrect');
            }
            req.session.racerInfo = racerDataObj;
            if (racerDataObj.temporaryPassword !== '') {
                // Has temporary password set
                console.log('Previously requested resetting password. Clearing that now');
                return Racer.update({
                    email: racerDataObj.email
                }, {
                    temporaryPassword: ''
                });
            }
            return false;
        })
        .then(function () {
            return res.ok({
                email: racerDataObj.email
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    update: function (req, res) {
        var input = req.body;
        var fields = ['email', 'phone', 'firstName', 'lastName', 'birthday', 'idNumber', 'password', 'isActive', 'hash'];
        var updateObj = {};

        fields.forEach(function (field) {
            if (input[field]) {
                updateObj[field] = input[field];
            }
        });
        Racer.update({
            id: input.id
        }, updateObj)
        .then(function (racerData) {
            return res.ok(racerData[0]);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
