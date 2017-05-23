/* eslint-disable no-param-reassign */
/* global Registration */

'use strict';

var bcrypt = require('bcrypt-nodejs');
var randomstring = require('randomstring');
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
                if (typeof input[field] !== 'undefined' && (originalData[field] !== input[field])) {
                    updateObj[field] = input[field];
                    toUpdate = true;
                }
            });
            if (toUpdate) {
                return updateObj;
            }
        } else {
            fields.forEach(function (field) {
                if (typeof input[field] !== 'undefined') {
                    updateObj[field] = input[field];
                }
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
            if (rules[rules.length - 1].rankTo >= racerNumberAllowed) {
                return false;
            }
            return true;
        },
        // May be deprecated
        noOverlap: function (rules) {
            var lastPos;
            var i;
            var raceId = rules[0].toRace;

            for (i = 0; i < rules.length; i += 1) {
                if (raceId !== rules[i].toRace) {
                    return false;
                }
                if (lastPos) {
                    if (rules[i].insertAt <= lastPos) {
                        return false;
                    }
                }
                lastPos = rules[i].insertAt + (rules[i].rankTo - rules[i].rankFrom);
            }
            return true;
        },
        noOverflow: function (rules, maxNumberAllowed) {
            var i;
            var raceId = rules[0].toRace;
            var totalRacers = 0;

            for (i = 0; i < rules.length; i += 1) {
                if (raceId !== rules[i].toRace) {
                    return false;
                }
                totalRacers += (rules[i].rankTo - rules[i].rankFrom + 1);
            }
            if (totalRacers > maxNumberAllowed) {
                return false;
            }
            return true;
        }
    },
    returnUpdatedRaceNotes: function (raceId, raceNote, existingRaceNotes) {
        var raceNotes = existingRaceNotes;
        var dataExist;
        var i;

        for (i = 0; i < existingRaceNotes.length; i += 1) {
            if (raceNotes[i].race === raceId) {
                raceNotes[i].note = raceNote;
                dataExist = true;
                break;
            }
        }
        if (!dataExist) {
            raceNotes.push({
                race: raceId,
                note: raceNote
            });
        }
        return raceNotes;
    },
    returnParsedRaceResult: function (recordsHashTable, laps, registrations) {
        var result = {
            dnf: [],
            disqualified: [],
            finished: [],
            finishedWithoutTime: []
        };
        var i;
        var isRacerDisqualified = function (epc, registrations) {
            var result;

            registrations.forEach(function (reg) {
                if (epc === reg.epc && reg.isDisqualified) {
                    result = true;
                }
            });
            return result;
        };

        for (i in recordsHashTable) {
            if (recordsHashTable.hasOwnProperty(i)) {
                // 1. 檢查選手有沒有失格 (disqualifiedRacers)
                // 2. 檢查資料長度, 最後一筆資料如果是 'dnf' 代表被套圈的選手 (dnfRacers)
                // 3. 承上, 裁判沒說除名的則是完賽但沒資料的選手 finishedRacersWithoutTime
                // 4. 其他資料正常者則為完賽選手 finishedRacers
                if (isRacerDisqualified(i, registrations)) {
                    result.disqualified.push({
                        epc: i,
                        data: recordsHashTable[i]
                    });
                } else if (recordsHashTable[i][recordsHashTable[i].length - 1] === 'dnf') {
                    result.dnf.push({
                        epc: i,
                        data: recordsHashTable[i]
                    });
                } else if (recordsHashTable[i].length <= laps) {
                    result.finishedWithoutTime.push({
                        epc: i,
                        data: recordsHashTable[i]
                    });
                } else {
                    result.finished.push({
                        epc: i,
                        data: recordsHashTable[i]
                    });
                }
            }
        }
        return result;
    },
    returnAccessCode: function (eventId) {
        var q = Q.defer();
        var codeLength = 4;
        var code = randomstring.generate({
            length: codeLength
        });
        var getCode = function (code) {
            Registration.findOne({
                event: eventId,
                accessCode: code
            })
            .then(function (modelData) {
                if (modelData) {
                    code = randomstring.generate({
                        length: codeLength
                    });
                    return getCode(code);
                }
                return q.resolve(code);
            });
        };

        getCode(code);
        return q.promise;
    }
};

module.exports = dataService;
