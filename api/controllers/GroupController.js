/* global Group, Race */

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
        Group.findOne({
            id: parseInt(req.params.id)
        })
        .populate('managers')
        .then(function (eventData) {
            return res.ok(eventData);
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
    // {group: ID}
    update: function (req, res) {
        var input = req.body;
        var updateObj = {};
        var query = {
            id: parseInt(input.group)
        };

        if (input.name) {
            updateObj.name = input.name;
        }
        if (input.nameCht) {
            updateObj.nameCht = input.nameCht;
        }
        if (input.isRegistrationOpen && input.isRegistrationOpen !== '') {
            updateObj.isRegistrationOpen = true;
        } else {
            updateObj.isRegistrationOpen = false;
        }
        if (input.isPublic && input.isPublic !== '') {
            updateObj.isPublic = true;
        } else {
            updateObj.isPublic = false;
        }
        Group.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Event updated',
                group: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
