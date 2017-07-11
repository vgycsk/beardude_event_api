/* eslint-disable no-console */
/* global _, dataService, Group, Race, Registration, sails */

'use strict';

var Q = require('q');
var RaceController = {
    // {group: ID, name: STR, nameCht: STR, laps: INT, racerNumberAllowed: INT, requirePacer: BOOL}
    create: function (req, res) {
        var input = req.body;

        Race.create(input)
        .then(function (modelData) {
            return res.ok({
                race: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Get public info
    getGeneralInfo: function (req, res) {
        Race.findOne({
            id: parseInt(req.params.id)
        })
        .populate('registrations')
        .populate('group')
        .then(function (modelData) {
            return res.ok({
                race: {
                    registrations: modelData.registrations,
                    group: modelData.group,
                    name: modelData.name,
                    laps: modelData.laps,
                    racerNumberAllowed: modelData.racerNumberAllowed,
                    advancingRules: modelData.advancingRules,
                    isEntryRace: modelData.isEntryRace,
                    requirePacer: modelData.requirePacer,
                    startTime: modelData.startTime,
                    endTime: modelData.endTime,
                    recordsHashTable: modelData.recordsHashTable,
                    result: modelData.result
                }
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Get complete info
    getManagementInfo: function (req, res) {
        Race.findOne({
            id: req.params.id
        })
        .populate('registrations')
//        .populate('group')
        .then(function (modelData) {
            return res.ok({
                race: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, name: STR, laps: INT, racerNumberAllowed: INT, isEntryRace: BOOL, requirePacer: BOOL}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'nameCht', 'laps', 'racerNumberAllowed', 'isEntryRace', 'requirePacer'];
        var updateObj = dataService.returnUpdateObj(fields, input);
        var query = {
            id: parseInt(input.id)
        };

        Race.update(query, updateObj)
        .then(function () {
            return Race.findOne(query)
            .populate('registrations');
        })
        .then(function (modelData) {
            return res.ok({
                race: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // /:id
    delete: function (req, res) {
        var query = {
            id: parseInt(req.params.id)
        };

        Race.findOne(query)
        .then(function (modelData) {
            // Race started
            if (modelData.startTime && modelData.startTime !== '') {
                throw new Error('Cannot delete a started race');
            }
            return Race.destroy(query);
        })
        .then(function () {
            return res.ok({
                race: query.id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, raceNumber: INT}
    addRacer: function (req, res) {
        var raceId = parseInt(req.body.race);
        var raceNumber = parseInt(req.body.raceNumber);
        var raceObj;
        var regId;
        var groupId;

        Race.findOne({
            id: raceId
        })
        .populate('registrations')
        .then(function (raceData) {
            var racerFound;

            raceObj = raceData;
            groupId = raceData.group;
            regId = _.find(raceData.registrations, {
                raceNumber: raceNumber
            });
            racerFound = _.find(raceData.registrations, {
                id: regId
            });
            if (racerFound) {
                throw new Error('Racer already in race');
            }
            return Registration.findOne({
                id: regId
            });
        })
        .then(function (regData) {
            if (regData.group !== groupId) {
                throw new Error('Racer not in group');
            }
            raceObj.registrations.add(regId);
            return raceObj.save();
        })
        .then(function () {
            return res.ok({
                messange: 'Racer added to race',
                race: raceId,
                raceNumber: raceNumber
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, raceNumber: INT}
    removeRacer: function (req, res) {
        var raceId = parseInt(req.body.race);
        var raceNumber = parseInt(req.body.raceNumber);

        Race.findOne({
            id: raceId
        })
        .populate('registrations')
        .then(function (raceData) {
            var regId = _.find(raceData.registrations, {
                raceNumber: raceNumber
            });

            if (!regId) {
                throw new Error('Racer not in race');
            }
            raceData.registrations.remove(regId);
            return raceData.save();
        })
        .then(function () {
            return res.ok({
                messange: 'Racer removed from race',
                race: raceId,
                raceNumber: raceNumber
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, epc: STR}
    assignPacerRfid: function (req, res) {
        var input = req.body;

        input.race = parseInt(input.race);
        Race.update({
            id: input.race
        }, {
            pacerEpc: input.epc
        })
        .then(function () {
            return res.ok({
                message: 'Pacer registered',
                race: input.race,
                epc: input.epc
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    //  {race: ID, advancingRules: [{rule1}, {rule2} ]}
    /*  advancingRules: { rankFrom: INT, rankTo: INT, toRace: ID, insertAt: INT }
        { rankFrom: 0, rankTo: 9, toRace: 2, insertAt: 0 },
        { rankFrom: 10, rankTo: 19, toRace: 3, insertAt: 0 }
    */
    updateAdvancingRules: function (req, res) {
        var input = req.body;
        var toRace = [];
        var notices = [];

        // 1. validate rules within this race
        if (!dataService.validateAdvRules.continuity(input.advancingRules)) {
            return res.badRequest('Must set rules for continuous rankings');
        }
        if (!dataService.validateAdvRules.startFromZero(input.advancingRules)) {
            return res.badRequest('Must set rankFrom from 0');
        }
        input.race = parseInt(input.race);
        input.advancingRules = _.sortBy(input.advancingRules, 'rankFrom');
        return Race.findOne({
            id: input.race
        })
        .then(function (modelData) {
            // 2. validate more rules within this race
            if (!dataService.validateAdvRules.maxRanking(input.advancingRules, modelData.racerNumberAllowed)) {
                throw new Error('Rule setting exceeds max racer');
            }
            input.advancingRules.forEach(function (rule) {
                toRace.push(rule.toRace);
            });
            _.uniq(toRace);
            return Group.findOne({
                id: modelData.group
            })
            .populate('races');
        })
        .then(function (modelData) {
            // 3. validate all toRace dont exceed max racer allowed
            // TO DO: validate all advanced race's all position are filled (show warning if not)
            toRace.forEach(function (toRaceId) {
                var advRulesForSameRace = _.filter(input.advancingRules, {
                    toRace: toRaceId
                });
                var raceObj = _.filter(modelData.races, {
                    id: toRaceId
                });

                modelData.races.forEach(function (otherRace) {
                    var matches = _.filter(otherRace.advancingRules, {
                        toRace: toRaceId
                    });

                    advRulesForSameRace = advRulesForSameRace.concat(matches);
                });
                if (!dataService.validateAdvRules.noOverlap(advRulesForSameRace)) {
                    notices.push('There may be overlapped racers in advanced race: ' + toRaceId);
                }
                if (!dataService.validateAdvRules.racerNumberMatched(advRulesForSameRace, raceObj.racerNumberAllowed)) {
                    notices.push('Advanced race spots unfilled: ' + toRaceId);
                }
                if (!dataService.validateAdvRules.noOverflow(advRulesForSameRace, raceObj.racerNumberAllowed)) {
                    throw new Error('Racer count exceed max number of advanced race');
                }
            });
            return Race.update({
                id: input.race
            }, {
                advancingRules: input.advancingRules
            });
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Advancing rules updated',
                race: input.race,
                advancingRules: modelData[0].advancingRules,
                notices: notices
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // /:id
    getParsedRaceResult: function (req, res) {
        var query = {
            id: parseInt(req.params.id)
        };

        Race.findOne(query)
        .populate('registrations')
        .then(function (raceData) {
            var result;

            if (!raceData.startTime || raceData.startTime === '') {
                throw new Error('Race not started');
            }
            if (!raceData.endTime || raceData.endTime === '') {
                throw new Error('Race not finished');
            }
            result = dataService.returnParsedRaceResult(raceData.recordsHashTable, raceData.laps, raceData.registrations);

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // 晉級規則 advancingRule: { rankFrom: INT, rankTo: INT, toRace: ID, insertAt: INT }
    // 該場比賽排名 rankings: [{registration: ID, time: INT/'dnf'}, {...}]
    advancingRacerToRace: function (advancingRule, rankings) {
        var q = Q.defer();

        Race.findOne({
            id: advancingRule.toRace
        })
        .populate('registrations')
        .then(function (raceData) {
            var i;
            var regId;

            for (i = advancingRule.rankFrom; i <= advancingRule.rankTo; i += 1) {
                regId = rankings[i].registration;
                raceData.registrations.add(regId);
            }
            return raceData.save();
        })
        .then(function () {
            return q.resolve({
                message: 'Racers allocated to coming races',
                race: advancingRule.toRace,
                rankFrom: advancingRule.rankFrom,
                rankTo: advancingRule.rankTo
            });
        })
        .catch(function (E) {
            return q.reject(E);
        });
        return q.promise;
    },
    /* {
        race: ID,
        rankings: [{registration: ID, time: INT/'dnf'}],
        disqualified: [{registration: ID, time: INT/dnf}]
    }*/
    submitRaceResult: function (req, res) {
        var input = req.body;
        var advancingRules;
        var completeRanking;
        var groupId;

        input.race = parseInt(input.race);
        Race.findOne({
            id: input.race
        })
        .then(function (raceData) {
            var funcs = [];

            advancingRules = raceData.advancingRules;
            groupId = raceData.group;
            if (advancingRules.length === 0) {
                return false;
            }
            advancingRules.forEach(function (rule) {
                funcs.push(RaceController.advancingRacerToRace(rule, input.rankings));
            });
            return Q.all(funcs);
        })
        .then(function () {
            completeRanking = input.rankings.concat(input.disqualified);
            return Race.update({
                id: input.race
            }, {
                result: completeRanking
            });
        })
        .then(function () {
            if (advancingRules.length === 0) {
                return Group.update({
                    id: groupId
                }, {
                    result: completeRanking
                });
            }
            return false;
        })
        .then(function (groupData) {
            var result = {
                message: 'Result submitted',
                race: input.race
            };

            if (groupData) {
                result.group = groupData[0].id;
            }
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, registrations: [ID, ID]]}
    // 順序跟排位有關的樣子
    assignRacersToRace: function (req, res) {
        var input = req.body;

        input.race = parseInt(input.race);
        Race.findOne({
            id: input.race
        })
        .populate('registrations')
        .then(function (raceData) {
            input.registrations.forEach(function (regId) {
                raceData.registrations.add(regId);
            });
            return raceData.save();
        })
        .then(function () {
            return res.ok({
                message: 'racers assigned successfully',
                race: input.race,
                registrations: input.registrations
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {registratration: ID, fromRace: ID, toRace: ID}
    reassignRacer: function (req, res) {
        var input = req.body;

        input.registratration = parseInt(input.registratration);
        input.fromRace = parseInt(input.fromRace);
        input.toRace = parseInt(input.toRace);
        Race.finOne({
            id: input.fromRace
        })
        .populate('registrations')
        .then(function (raceData) {
            raceData.registrations.remove(input.registratration);
            return raceData.save();
        })
        .then(function () {
            return Race.finOne({
                id: input.toRace
            })
            .populate('registrations');
        })
        .then(function (raceData) {
            raceData.registrations.add(input.registratration);
            return raceData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racer moved successfully',
                registration: input.registratration,
                fromRace: input.fromRace,
                toRace: input.toRace
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },

    /**
    * join | register to reader room
    * java (reader) side doesnt sent by sails.socket.io.get, so making a query string as flag to make sure its socket connection
    * but just use sails.socket.io.get when js call
    **/
    joinReaderRoom: function (req, res) {
        var query = req.query;
        var joinSocket = query.sid;
        var isSocket = query.isSocket;

        if (!joinSocket) {
            joinSocket = req;
        }
        if (!isSocket) {
            if (!req.isSocket) {
                return res.badRequest();
            }
            isSocket = req.isSocket;
        }
        // let the connection join the socket channel
        sails.sockets.join(joinSocket, 'readerSockets');
        return res.json({
            result: 'join socket_channel_OK'
        });
    },

    /**
    * reader accessing, including starting, receiving race data, terminating
    **/
    readerReceiver: function (req, res) {
        var isSocket = req.isSocket;
        var socketReq = req.query.sid;
        var input = req.body;
        var type = input.type;
        var payload = input.payload;

        if (!isSocket) {
            if (!req.query.isSocket) {
                return res.badRequest();
            }
            isSocket = req.query.isSocket;
        }
        if (!socketReq) {
            socketReq = req;
        }
        switch (type) {
        case 'startreader':
            sails.sockets.broadcast('readerSockets', 'startreader', {
                result: 'success'
            }, socketReq);
            break;

        case 'rxdata':
            // change the 'rxdata' for mapping a unique event name to a reader, if there are other readers.
            console.log('broadcast rxdata');
            sails.sockets.broadcast('readerSockets', 'rxdata', {
                result: payload
            }, socketReq);
            // to-do: write to DB
            break;

        case 'terminatereader':
            sails.sockets.broadcast('readerSockets', 'terminatereader', {
                result: 'success'
            }, socketReq);
            break;

        default:
            break;
        }

        return res.json({
            result: 'type-' + type + '_receive_OK'
        });
    }
};

module.exports = RaceController;
