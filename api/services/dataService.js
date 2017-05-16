
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
    },
    // rule: { rankFrom: INT, rankTo: INT, toRace: ID, insertAt: INT }
    /*
        { rankFrom: 0, rankTo: 9, toRace: 2, insertAt: 0 }
        { rankFrom: 10, rankTo: 19, toRace: 3, insertAt: 0 }
    */
    validateAdvRules: {
        continuity: function (rules) {
            var i;

            for (i = 1; i < rules.length; i += 1) {
                if ((rules[i].rankFrom - rules[i - 1].rankTo) !== 1) {
                    return false;
                }
            }
            return true;
        },
        //'Must set rule from first place racer'
        startFromZero: function (rules) {
            if (rules[0].rankFrom !== 0) {
                return false;
            }
            return true;
        },
        maxRanking: function (rules, racerNumberAllowed) {
            if (rules[rules.length - 1].rankTo > racerNumberAllowed) {
                return false;
            }
            return true;
        },
        noOverlap: function (rules) {
            var lastPos;
            var i;

            for (i = 0; i < rules.length; i += 1) {
                lastPos = rules[i].insertAt + (rules[i].rankTo - rules[i].rankFrom);
                if (rules[i + 1].insertAt <= lastPos) {
                    return false;
                }
            }
            return true;
        }
    }
};

module.exports = dataService;
