
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

        fields.forEach(function (field) {
            if (input[field] && (originalData[field] !== input[field])) {
                updateObj[field] = input[field];
                toUpdate = true;
            }
        });
        if (toUpdate) {
            return updateObj;
        }
        return false;
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
