/* global _, dataService, Group, Race */

'use strict';

module.exports = {
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
            id: req.params.id
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
            Race.update(query, updateObj);
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Race updated',
                race: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, racers: [ID, ID]}
    addRacers: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.race)
        };
        var raceDataObj;
        var racersToAdd;

        input.racers.forEach(function (racer, index) {
            input.racers[index] = parseInt(racer);
        });
        Race.findOne(query)
        .populate('registrations')
        .then(function (modelData) {
            raceDataObj = modelData;
            return Group.findOne({
                id: modelData.group
            })
            .populate('registrations');
        })
        .then(function (modelData) {
            var racerNotInGroup = _.difference(input.racers, modelData.racers);

            // 1. validate racers in group
            if (racerNotInGroup.length > 0) {
                throw new Error('Racer not in group');
            }
            // 2. Get racers not in race
            racersToAdd = _.difference(input.racers, raceDataObj);
            racersToAdd.forEach(function (racerInput) {
                raceDataObj.racers.add(racerInput);
            });
            return raceDataObj.save();
        })
        .then(function () {
            return res.ok({
                messange: 'Racers added to race',
                racers: racersToAdd
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, racers: [ID, ID]}
    removeRacers: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.race)
        };
        var raceDataObj;
        var racersToRemove;

        input.racers.forEach(function (racer, index) {
            input.racers[index] = parseInt(racer);
        });
        Race.findOne(query)
        .populate('registrations')
        .then(function (modelData) {
            raceDataObj = modelData;
            return Group.findOne({
                id: modelData.group
            })
            .populate('registrations');
        })
        .then(function (modelData) {
            var racerNotInGroup = _.difference(input.racers, modelData.racers);

            // 1. validate racers in group
            if (racerNotInGroup.length > 0) {
                throw new Error('Racer not in group');
            }
            // 2. Get racers not in race
            racersToRemove = _.intersection(input.racers, raceDataObj);
            racersToRemove.forEach(function (racerInput) {
                raceDataObj.racers.add(racerInput);
            });
            return raceDataObj.save();
        })
        .then(function () {
            return res.ok({
                messange: 'Racers removed from race',
                racers: racersToRemove
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
            id: input.id
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
    // {race: ID, epc: STR}
    assignTesterRfid: function (req, res) {
        var input = req.body;

        input.race = parseInt(input.race);
        Race.findOne({
            id: input.id
        })
        .then(function (modelData) {
            var testerEpc = modelData.testerEpc;
            var rfidExist = _.includes(testerEpc, input.epc);

            if (rfidExist) {
                return false;
            }
            testerEpc.push(input.epc);
            return Race.update({
                id: input.id
            }, {
                testerEpc: testerEpc
            });
        })
        .then(function (modelData) {
            var message = 'Tester registered';

            if (!modelData) {
                message = 'Tester RFID already assigned';
            }
            return res.ok({
                message: message,
                race: input.race,
                epc: input.epc
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, advancingRules: [{rule1}, {rule2} ]}
    // rule: { rankFrom: INT, rankTo: INT, toRace: ID, insertAt: INT }
    /*
        { rankFrom: 0, rankTo: 9, toRace: 2, insertAt: 0 }
        { rankFrom: 10, rankTo: 19, toRace: 3, insertAt: 0 }
    */
    updateAdvancingRules: function (req, res) {
        var input = req.body;
        var toRace = [];

        input.race = parseInt(input.race);
        input.advancingRules = _.sortBy(input.advancingRules, 'rankFrom');
        Race.findOne({
            id: input.race
        })
        .then(function (modelData) {
            if (!dataService.validateAdvRules.continuity(input.advancingRules)) {
                throw new Error('Must set rules for continuous rankings');
            }
            if (!dataService.validateAdvRules.startFromZero(input.advancingRules)) {
                throw new Error('Must set rules for continuous rankings');
            }
            if (!dataService.validateAdvRules.maxRanking(input.advancingRules, modelData.racerNumberAllowed)) {
                throw new Error('Rule setting exceeds max racer');
            }
            input.advancingRules.forEach(function (rule) {
                toRace.push(rule.toRace);
            });
            _.uniq(toRace);
            Group.findOne({
                id: modelData.group
            })
            .populate('races');
        })
        .then(function (modelData) {
            var rulesByRace = [];
            var racesToCheck = [];

            modelData.races.forEach(function (race) {
                if (race.id !== input.race) {
                    racesToCheck.push(race);
                }
            });
            // validate advancing rules' insertAt dont overlap
            toRace.forEach(function (raceId) {
                var rulesForSameRace = [];

                racesToCheck.advancingRules.forEach(function (rule) {
                    if (rule.toRace === raceId) {
                        rulesForSameRace.push(rule);
                    }
                });
                input.advancingRules.forEach(function (rule) {
                    if (rule.toRace === raceId) {
                        rulesForSameRace.push(rule);
                    }
                });
                rulesByRace.push(rulesForSameRace);
            });
            rulesByRace.forEach(function (rulesForSameRace) {
                var sortedRules = _.sortBy(rulesForSameRace, 'insertAt');

                if (!dataService.validateAdvRules.noOverlap(sortedRules)) {
                    throw new Error('Inserting position overlaps with other race\'s rules');
                }
            });
            return Race.update({
                id: input.race
            }, {
                advancingRules: input.advancingRules
            });
            // validate all advanced race's all position are filled (show warning if not)
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Advancing rules updated',
                race: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
