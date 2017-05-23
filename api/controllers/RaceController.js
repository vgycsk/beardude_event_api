/* global _, dataService, Group, Race, Registration */

'use strict';

var Q = require('q');
var RaceController = {
    // {group: ID, name: STR, laps: INT, racerNumberAllowed: INT, isCheckinOpen: BOOL, requirePacer: BOOL}
    create: function (req, res) {
        var input = req.body;
        var createObj = {
            group: parseInt(input.group),
            name: input.name,
            laps: parseInt(input.laps),
            racerNumberAllowed: parseInt(input.racerNumberAllowed)
        };

        if (input.isCheckinOpen && input.isCheckinOpen !== '') {
            createObj.isCheckinOpen = true;
        } else {
            createObj.isCheckinOpen = false;
        }
        if (input.requirePacer && input.requirePacer !== '') {
            createObj.requirePacer = true;
        } else {
            createObj.requirePacer = false;
        }
        Race.create(createObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Race created',
                race: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID}
    delete: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.race)
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
                message: 'Race deleted',
                race: input.race
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
            var result = {
                registrations: modelData.registrations,
                group: modelData.group,
                name: modelData.name,
                laps: modelData.laps,
                racerNumberAllowed: modelData.racerNumberAllowed,
                advancingRules: modelData.advancingRules,
                isCheckinOpen: modelData.isCheckinOpen,
                requirePacer: modelData.requirePacer,
                startTime: modelData.startTime,
                endTime: modelData.endTime,
                recordsHashTable: modelData.recordsHashTable,
                result: modelData.result
            };

            return res.ok(result);
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
        .populate('group')
        .then(function (modelData) {
            return res.ok(modelData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, name: STR, laps: INT, racerNumberAllowed: INT, isCheckinOpen: BOOL, requirePacer: BOOL}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'laps', 'racerNumberAllowed', 'isCheckinOpen', 'requirePacer'];
        var updateObj;
        var query = {
            id: parseInt(input.race)
        };

        Race.findOne(query)
        .then(function (modelData) {
            updateObj = dataService.returnUpdateObj(fields, input, modelData);
            return Race.update(query, updateObj);
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Race updated',
                race: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, race: ID, raceNumber: INT}
    addRacer: function (req, res) {
        var input = {
            event: parseInt(req.body.event),
            race: parseInt(req.body.race),
            raceNumber: parseInt(req.body.raceNumber)
        };
        var regId;

        Registration.findOne({
            event: input.event,
            raceNumber: input.raceNumber
        })
        .then(function (regData) {
            regId = regData.id;
            return Group.findOne({
                id: regData.group
            })
            .populate('registrations');
        })
        .then(function (groupData) {
            var racerFound = _.find(groupData.registrations, {
                id: regId
            });

            if (!racerFound) {
                throw new Error('Racer not in group');
            }
            return Race.findOne(input.race)
            .populate('registrations');
        })
        .then(function (raceData) {
            var racerFound = _.find(raceData.registrations, {
                id: regId
            });

            if (racerFound) {
                throw new Error('Racer already in race');
            }
            raceData.registrations.add(regId);
            return raceData.save();
        })
        .then(function () {
            return res.ok({
                messange: 'Racer added to race',
                race: input.race,
                raceNumber: input.raceNumber
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, race: ID, raceNumber: INT}
    removeRacer: function (req, res) {
        var input = {
            event: parseInt(req.body.event),
            race: parseInt(req.body.race),
            raceNumber: parseInt(req.body.raceNumber)
        };
        var regId;

        Registration.findOne({
            event: input.event,
            raceNumber: input.raceNumber
        })
        .then(function (regData) {
            regId = regData.id;
            return Race.findOne(input.race)
            .populate('registrations');
        })
        .then(function (raceData) {
            var racerFound = _.find(raceData.registrations, {
                id: regId
            });

            if (!racerFound) {
                throw new Error('Racer not in race');
            }
            raceData.registrations.remove(regId);
            return raceData.save();
        })
        .then(function () {
            return res.ok({
                messange: 'Racer removed from race',
                race: input.race,
                raceNumber: input.raceNumber
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

    // {race: ID, advancingRules: [{rule1}, {rule2} ]}
    /*
    advancingRules: { rankFrom: INT, rankTo: INT, toRace: ID, insertAt: INT }
        { rankFrom: 0, rankTo: 9, toRace: 2, insertAt: 0 }
        { rankFrom: 10, rankTo: 19, toRace: 3, insertAt: 0 }
    */
    updateAdvancingRules: function (req, res) {
        var input = req.body;
        var toRace = [];

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
            var result = {
                message: 'Advancing rules updated',
                race: input.race,
                advancingRules: modelData[0].advancingRules
            };

            // to do: add notice for warning
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getParsedRaceResult: function (req, res) {
        var input = req.params.id;

        input.race = parseInt(input.race);
        Race.findOne({
            id: input.race
        })
        .populate('registrations')
        .then(function (raceData) {
            if (raceData.endTime && raceData.endTime !== '') {
                return Race.findOne({
                    id: input.race
                })
                .populate('registrations');
            }
            throw new Error('Race not finished');
        })
        .then(function (raceData) {
            var result = dataService.returnParsedRaceResult(raceData.recordsHashTable, raceData.laps, raceData.registrations);

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    advancingRacerToRace: function (advancingRule, ranking) {
        var q = Q.defer();

        Race.findOne({
            id: advancingRule.toRace
        })
        .populate('registrations')
        .then(function (raceData) {
            var i;
            var regId;

            for (i = advancingRule.rankFrom; i <= advancingRule.rankTo; i += 1) {
                regId = ranking[i].registration;
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
    /* {race: ID,
        ranking: [{registration: ID, time: INT/'dnf'}],
        disqualified: [{registration: ID, time: INT/dnf}]}
    */
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
                funcs.push(function () {
                    return RaceController.advancingRacerToRace(rule, input.ranking);
                });
            });
            return Q.all(funcs);
        })
        .then(function () {
            completeRanking = input.ranking.concat(input.disqualified);

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
    }
};

module.exports = RaceController;
