
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
    }
};

module.exports = dataService;
