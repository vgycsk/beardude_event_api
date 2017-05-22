/* global dataService, Group, Race, Registration, Team */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;

        input.isPublic = false;
        input.isRegistrationOpen = false;
        Group.create(input)
        .then(function (modelData) {
            return res.ok({
                message: 'Group created',
                group: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getInfo: function (req, res) {
        var result;
        var groupId = parseInt(req.params.id);

        Group.findOne({
            id: groupId
        })
        .populate('races')
        .then(function (modelData) {
            result = modelData;
            return Team.find({});
        })
        .then(function (modelData) {
            result.team = modelData;
            return Registration.find({
                group: groupId,
                paid: true
            })
            .populate('racer');
        })
        .then(function (modelData) {
            var result = [];

            modelData.forEach(function (reg) {
                result.push({
                    races: reg.races,
                    event: reg.event,
                    group: reg.group,
                    racer: {
                        team: reg.racer.team,
                        firstName: reg.racer.firstName,
                        lastName: req.racer.lastName,
                        nickName: req.racer.nickName
                    },
                    raceNumber: reg.raceNumber
                });
            });
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getManagementInfo: function (req, res) {
        var result;
        var groupId = parseInt(req.params.id);

        Group.findOne({
            id: groupId
        })
        .populate('races')
        .then(function (modelData) {
            result = modelData;
            return Team.find({});
        })
        .then(function (modelData) {
            result.team = modelData;
            return Registration.find({
                group: groupId
            })
            .populate('racer');
        })
        .then(function (modelData) {
            result.registrations = modelData;
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {group: ID}
    delete: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.group)
        };
        var racesToDestroy = [];

        // Validate: only can delete those without registration
        Group.findOne({
            id: query
        })
        .populate('registration')
        .populate('races')
        .then(function (modelData) {
            if (modelData.registration.length > 0) {
                throw new Error('Cannot delete group that has racers registered');
            }
            modelData.races.forEach(function (race) {
                racesToDestroy.push(race.id);
            });
            if (racesToDestroy.length === 0) {
                return false;
            }
            return Race.destroy({
                id: racesToDestroy
            });
        })
        .then(function () {
            return Group.destroy(query);
        })
        .then(function () {
            return res.ok({
                message: 'Group deleted',
                group: input.group,
                races: racesToDestroy
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {group: ID, name: STR, nameCht: STR}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'nameCht', 'rules'];
        var query = {
            id: parseInt(input.group)
        };
        var updateObj = dataService.returnUpdateObj(fields, input);

        Group.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Group updated',
                group: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {group: ID, isRegistrationOpen: BOOL, isTeamRegistrationOpen, BOOL, isPublic: BOOL}
    updateSwitch: function (req, res) {
        var fields = ['isRegistrationOpen', 'isTeamRegistrationOpen', 'isPublic'];
        var input = req.body;
        var query = {
            id: parseInt(input.group)
        };
        var updateObj;

        fields.forEach(function (field) {
            if (input[field] && input[field] !== '') {
                updateObj[field] = true;
            } else {
                updateObj[field] = false;
            }
        });
        Group.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Group boolean field(s) updated',
                group: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
