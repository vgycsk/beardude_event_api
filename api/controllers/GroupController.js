/* global dataService, Group, Race, Registration, Team */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;

        if (input.isPublic && input.isPublic !== '') {
            input.isPublic = true;
        } else {
            input.isPublic = false;
        }
        if (input.isRegistrationOpen && input.isRegistrationOpen !== '') {
            input.isRegistrationOpen = true;
        } else {
            input.isRegistrationOpen = false;
        }
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
        var fields = ['name', 'nameCht'];
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
    // {group: ID, openRegistration: BOOL}
    updateIsRegistrationOpen: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.group)
        };
        var updateObj = {
            isRegistrationOpen: false
        };

        if (input.isRegistrationOpen && input.isRegistrationOpen !== '') {
            updateObj.isRegistrationOpen = true;
        }
        Group.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Group isRegistrationOpen updated',
                group: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {group: ID, isPublic: BOOL}
    updateIsPublic: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.group)
        };
        var updateObj = {
            isPublic: false
        };

        if (input.isPublic && input.isPublic !== '') {
            updateObj.isPublic = true;
        }
        Group.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Group isPublic updated',
                group: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
