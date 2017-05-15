/* global dataService, Team */

'use strict';

module.exports = {
    // {team: ID, racer: ID}
    approveRacer: function (req, res) {
        var input = req.body;

        input.racer = parseInt(input.racer);
        Team.findOne({
            id: parseInt(input.team)
        })
        .populate('racers')
        .populate('racersApplication')
        .then(function (modelData) {
            var racerToAdd;

            modelData.racersApplication.forEach(function (racer) {
                if (racer === input.racer) {
                    racerToAdd = input.racer;
                }
            });
            if (!racerToAdd) {
                throw new Error('Racer application not found');
            }
            modelData.racers.add(input.racer);
            modelData.racersApplication.remove(input.racer);
            return modelData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racer added to your team',
                racer: input.racer
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {name: STR, desc: STR, url: STR}
    create: function (req, res) {
        var input = req.body;

        input.uniqueName = dataService.sluggify(input.name);
        input.leader = req.session.racerInfo.id;
        Team.create(input)
        .then(function (teamData) {
            return res.ok({
                message: 'Team created',
                event: teamData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
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
    getInfo: function (req, res) {
        Team.findOne({
            id: parseInt(req.params.id)
        })
        .populate('racers')
        .populate('racersApplication')
        .then(function (teamData) {
            var result = teamData;

            result.racers.forEach(function (racer) {
                if (racer.id === result.leader) {
                    result.leader = racer;
                }
            });
            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {team: ID}
    update: function (req, res) {
        var input = req.body;
        var fields = ['name', 'description', 'url'];
        var updateObj;

        Team.findOne({
            id: parseInt(input.team)
        })
        .then(function (modelData) {
            updateObj = dataService.returnUpdateObj(fields, input, modelData);
            return Team.update({
                id: input.team
            }, updateObj);
        })
        .then(function (teamData) {
            return res.ok({
                message: 'Team updated',
                event: teamData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {team: ID, racer: ID}
    removeRacer: function (req, res) {
        var input = req.body;

        input.racer = parseInt(input.racer);
        Team.findOne({
            id: parseInt(input.team)
        })
        .populate('racers')
        .then(function (teamData) {
            var found;

            teamData.racers.forEach(function (racer) {
                if (racer.id === input.racer) {
                    found = true;
                }
            });
            if (!found) {
                throw new Error('Racer not in the team');
            }
            teamData.racers.remove(input.racer);
            return teamData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racers removed',
                team: input.team,
                racer: input.racer
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
