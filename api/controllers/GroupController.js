/* global dataService, Group, Race, Registration, Team */

'use strict';

module.exports = {
    // { event: ID, name: STR, nameCht: STR, rules: STR }
    create: function (req, res) {
        var input = req.body;
        Group.create(input)
        .then(function (modelData) {
            return res.ok({
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
//                paid: true
            })
            .populate('racer');
        })
        .then(function (modelData) {
            result.registrations = modelData.map(function (reg) {
                return {
                    racer: {
                        id: reg.racer.id,
                        team: reg.racer.team,
                        firstName: reg.racer.firstName,
                        lastName: reg.racer.lastName,
                        nickName: reg.racer.nickName
                    },
                    raceNumber: reg.raceNumber
                }
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
            return Race.find({
              group: groupId
            })
            .populate('registrations');
        })
        .then(function (modelData) {
          result.races = modelData
          return res.ok({
            group: result
          });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {id: ID}
    delete: function (req, res) {
        var query = {
            id: parseInt(req.params.id)
        };

        Group.findOne(query)
        .populate('registrations')
        .populate('races')
        .then(function (modelData) {
            if (modelData.registrations.length > 0) {
                throw new Error('Cannot delete group that has racers registered');
            }
            if (modelData.races.length > 0) {
                throw new Error('Cannot delete group that contains races');
            }
            return Group.destroy(query);
        })
        .then(function () {
            return res.ok({
                group: query.id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {id: ID, name: STR, nameCht: STR, racerNumberAllowed: INT, rules: ARRAY}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'nameCht', 'racerNumberAllowed', 'rules'];
        var query = {
            id: parseInt(input.id)
        };
        var updateObj = dataService.returnUpdateObj(fields, input);

        Group.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                group: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
