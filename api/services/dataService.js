/* eslint-disable no-console */
/* global _, sails */

'use strict';

var bcrypt = require('bcrypt-nodejs');
var Q = require('q');
var randomstring = require('randomstring');
var dataService = {
    authenticate: function (inputPassword, userDataPassword) {
        var q = Q.defer();

        bcrypt.compare(inputPassword, userDataPassword, function (err, compareResult) {
            if (err) {
                return q.reject('bcrypt compare error');
            }
            if (!compareResult) {
                return q.resolve(false);
            }
            return q.resolve(true);
        });
        return q.promise;
    },
    requestTemporaryPassword: function (res, modelName, queryObject) {
        var temporaryPassword = randomstring.generate();

        return sails.models[modelName].update(queryObject, {
            temporaryPassword: temporaryPassword
        })
        .then(function () {
            console.log('temporary password: ', temporaryPassword);
            // TO DO: Send temporary password to user's email
            return res.ok('A temporary password is set.');
        });
    },
    resetPassword: function (req, res, modelName) {
        var input = req.body;
        var queryObject;

        if (modelName === 'systemuser') {
            if (!req.body.name) {
                return res.badRequest('Missing user name');
            }
            queryObject = {
                name: req.body.name
            };
        } else {
            if (!req.body.email) {
                return res.badRequest('Missing user email');
            }
            queryObject = {
                email: req.body.email
            };
        }
        if (!input.temporaryPassword) {
            return res.badRequest('Missing temporary password');
        }
        if (input.password !== input.confirmPassword) {
            return res.badRequest('Password and confirm-password fields do not match');
        }
        return sails.models[modelName].findOne(queryObject)
        .then(function (userData) {
            return dataService.authenticate(input.temporaryPassword, userData.temporaryPassword);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('Temporary password incorrect');
            }
            return sails.models[modelName].update(queryObject, {
                password: input.password,
                temporaryPassword: ''
            });
        })
        .then(function () {
            return res.ok('Password updated');
        })
        .catch(function (E) {
            var error = E;

            delete error.rawStack;
            delete error.stack;
            return res.badRequest(error);
        });
    },
    returnWeekdayKeys: function () {
        return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    },
    tidyBusinessHour: function (businessHourRaw) {
        var businessHour = {};

        _.forOwn(businessHourRaw, function (hour, key) {
            if (hour.closed && hour.closed !== '') {
                businessHour[key] = {
                    closed: true
                };
                // Closed
            } else if (hour.all) {
                businessHour[key] = {
                    all: true
                };
            } else if (hour.from !== '' && hour.to !== '') {
                businessHour[key] = hour;
            } else if ((hour.from !== '' && hour.to === '') || (hour.from === '' && hour.to !== '')) {
                throw new Error('Business hour info incomplete');
            }
        });
        return businessHour;
    },
    tidyShiftsArray: function (shifts) {
        var result = [];

        shifts.forEach(function (shift) {
            if (shift.name !== '' && shift.from !== '' && shift.to !== '') {
                return result.push(shift);
            } else if (shift.name === '' && shift.from === '' && shift.to === '') {
                return false;
            }
            throw new Error('Shift info incomplete');
        });
        return result;
    },
    sluggify: function (string) {
        if (string) {
            return string
            .trim()
            .toLowerCase()
            // remove hyphen
            //.replace(/[^\w ]+/g,'')
            // remove special char
            .replace(/[^\w\s]/gi, '')
            // condense
            .replace(/ +/g, '');
        }
        return string;
    }
};

module.exports = dataService;
