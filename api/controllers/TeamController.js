/* global _, Team */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;

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
    getInfo: function (req, res) {
        Team.findOne({
            id: parseInt(req.params.id)
        })
        .populate('racers')
        .then(function (teamData) {
            return res.ok(teamData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    changeName: function (req, res) {
        var input = req.body;

        Team.update({
            id: input.id
        }, {
            name: input.name
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
    addRacers: function (req, res) {
        var input = req.body;

        input.racers.forEach(function (racer, index) {
            input.racers[index] = parseInt(racer);
        });
        Team.findOne({
            id: parseInt(input.team)
        })
        .populate('racers')
        .then(function (teamData) {
            var racersToAdd = _.difference(input.racers, teamData.racers);

            if (racersToAdd.length === 0) {
                throw new Error('No racers to add');
            }
            racersToAdd.forEach(function (inputRacer) {
                teamData.racers.add(inputRacer);
            });
            return teamData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racers added',
                team: input.team,
                racers: input.racers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    removeRacers: function (req, res) {
        var input = req.body;

        input.racers.forEach(function (racer, index) {
            input.racers[index] = parseInt(racer);
        });
        Team.findOne({
            id: parseInt(input.team)
        })
        .populate('racers')
        .then(function (teamData) {
            var racersToRemove = _.intersection(input.racers, teamData.racers);

            if (racersToRemove.length === 0) {
                throw new Error('No racers to remove');
            }
            racersToRemove.forEach(function (racerId) {
                teamData.racers.remove(racerId);
            });
            return teamData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racers added',
                team: input.team,
                racers: input.racers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
