/* global dataService, Team */

'use strict';

var Q = require('q');
var TeamController = {
    // {name: STR}
    nameAvailable: function (req, res) {
        Team.findOne({
            name: req.body.name
        })
        .then(function (result) {
            var msg = true;

            if (result) {
                msg = false;
            }
            return res.ok({
                name: req.body.name,
                available: msg
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {name: STR, desc: STR, url: STR, leader: ID}
    createTeam: function (input) {
        var q = Q.defer();
        var obj = {
            name: input.name,
            nameCht: input.nameCht,
            description: input.description,
            url: input.url
        };

        if (input.leader) {
            obj.leader = input.leader;
        }
        Team.create(obj)
        .then(function (teamData) {
            return q.resolve(teamData);
        })
        .catch(function (E) {
            return q.reject(E);
        });
        return q.promise;
    },
    // {name: STR, desc: STR, url: STR}
    create: function (req, res) {
        var input = req.body;

        if (req.session.racerInfo) {
            input.leader = req.session.racerInfo.id;
        }
        TeamController.createTeam(input)
        .then(function (teamData) {
            return res.ok({
                message: 'Team created',
                team: teamData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /*
    // {team: ID}
    delete: function (req, res) {
        var input = req.body;

        if (req.session.racerInfo.id !== req.session.racerInfo.team.leader) {
            throw new Error('Only team leader can delete a team');
        }
        Team.destroy({
            id: parseInt(input.team)
        })
        .then(function () {
            return res.ok({
                message: 'Team deleted',
                team: input.team
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    */
    getInfo: function (req, res) {
        Team.findOne({
            id: parseInt(req.params.id)
        })
        .populate('racers')
        .then(function (teamData) {
            return res.ok({
                team: teamData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getTeams: function (req, res) {
        Team.find({})
        .then(function (teamData) {
            return res.ok({
                teams: teamData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {id: ID}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'nameCht', 'description', 'url', 'leader'];
        var queryObj = {
            id: parseInt(input.id)
        };

        Team.findOne(queryObj)
        .then(function (modelData) {
            var updateObj = dataService.returnUpdateObj(fields, input);

            if (updateObj.leader) {
                updateObj.leader = parseInt(updateObj.leader);
            }
            return Team.update(queryObj, updateObj);
        })
        .then(function () {
            return Team.findOne(queryObj)
            .populate('racers');
        })
        .then(function (modelData) {
            input.racers.forEach(function (racer) {
                if (racer.toAdd) {
                    modelData.racers.add(racer.id);
                } else if (racer.toRemove) {
                    modelData.racers.remove(racer.id);
                }
            });
            return modelData.save();
        })
        .then(function () {
            return Team.findOne(queryObj)
            .populate('racers');
        })
        .then(function (modeldata) {
            return res.ok({
                team: modeldata
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
    // {id: ID, racer: ID}
    // invite: function (req, res) {},
    // {id: ID, racer: ID}
    // acceptInvitation: function (req, res) {}
};

module.exports = TeamController;
