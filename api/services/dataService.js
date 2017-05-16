
'use strict';

var bcrypt = require('bcrypt-nodejs');
var Q = require('q');
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
    returnUpdateObj: function (fields, input, originalData) {
        var updateObj = {};
        var toUpdate;

        if (originalData) {
            fields.forEach(function (field) {
                if (input[field] && (originalData[field] !== input[field])) {
                    updateObj[field] = input[field];
                    toUpdate = true;
                }
            });
            if (toUpdate) {
                return updateObj;
            }
        } else {
            fields.forEach(function (field) {
                updateObj[field] = input[field];
            });
            return updateObj;
        }
        return false;
    },
    sluggify: function (string) {
        return string
        .toLowerCase()
//        .replace(/[^\w ]+/g,'') // remove hyphen
        // remove special char
        .replace(/[^\w\s]/gi, '')
        // condense
        .replace(/ +/g, '');
    }
};

module.exports = dataService;
