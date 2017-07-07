/* global dataService, Group, Race, Registration, Team */

'use strict';

module.exports = {
    // { event: ID, name: STR, nameCht: STR, rules: STR }
    create: function (req, res) {
        var input = req.body;

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
        var result = {};
        var groupId = parseInt(req.params.id);

        Group.findOne({
            id: groupId
        })
        .populate('races')
        .then(function (modelData) {
            result = modelData.toJSON();
            return Team.find({});
        })
        .then(function (modelData) {
            result.teams = modelData;
            return Registration.find({
                group: groupId
            })
            .populate('racer');
            /*
            return Registration.find({
                group: groupId,
                paid: true
            })
            .populate('racer');
            */
        })
        .then(function (modelData) {
            result.registrations = [];
            modelData.forEach(function (reg) {
                result.registrations.push({
                    racer: {
                        id: reg.racer.id,
                        team: reg.racer.team,
                        firstName: reg.racer.firstName,
                        lastName: reg.racer.lastName,
                        nickName: reg.racer.nickName
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
            result = modelData.toJSON();
            return Registration.find({
                group: groupId
            })
            .populate('racer');
        })
        .then(function (modelData) {
            result.registrations = modelData;
            result.registrations.map(function (reg, i) {
              var temp = {
                  id: reg.racer.id,
                  firstName: reg.racer.firstName,
                  lastName: reg.racer.lastName
              };
              result.registrations[i].racer = temp;
            })

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {group: ID}
    delete: function (req, res) {
        var query = {
            id: parseInt(req.params.id)
        };
        var racesToDestroy = [];

        // Validate: only can delete those without registration
        Group.findOne({
            id: query
        })
        .populate('registrations')
        .populate('races')
        .then(function (modelData) {
            if (modelData.registrations.length > 0) {
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
                group: query.id,
                races: racesToDestroy
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {group: ID, name: STR, nameCht: STR, rules: ARRAY}
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
    }
};
