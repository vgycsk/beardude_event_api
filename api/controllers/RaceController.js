/* global dataService, Race */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;
        var createObj = {
            group: parseInt(input.group),
            name: input.name,
            laps: parseInt(input.laps),
            racerNumberAllowed: parseInt(input.racerNumberAllowed),
            advancingRule: input.advancingRule
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
                advancingRule: modelData.advancingRule,
                isCheckinOpen: modelData.isCheckinOpen,
                requirePacer: modelData.requirePacer,
                startTime: modelData.startTime,
                endTime: modelData.endTime,
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
    // {race: ID, ...}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'laps', 'racerNumberAllowed', 'advancingRule', 'isCheckinOpen', 'requirePacer'];
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
        });
    }
};
