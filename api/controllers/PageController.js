/* global Event, Group, Manager, Race, Racer, Registration */
'use strict';

var Q = require('q');
var returnParams = function (session) {
    var q = Q.defer();
    var params = {
        session: session
    };

    Event.find({})
    .populate('managers')
    .populate('groups')
    .then(function (eventData) {
        params.events = eventData;
        return Manager.find({})
        .populate('events')
        .populate('address');
    })
    .then(function (managerData) {
        params.managers = managerData;
        return Race.find({})
        .populate('racers')
        .populate('event');
    })
    .then(function (raceData) {
        params.races = raceData;
        return Racer.find({})
        .populate('address');
    })
    .then(function (racerData) {
        params.racers = racerData;
        return Group.find({})
        .populate('racers')
        .populate('races');
    })
    .then(function (groupData) {
        params.groups = groupData;
        return Registration.find({});
    })
    .then(function (regData) {
        params.registrationData = regData;
        return q.resolve(params);
    })
    .catch(function (E) {
        return q.reject('Broken: ', E);
    });
    return q.promise;
};

module.exports = {
    apiTestPage: function (req, res) {
        returnParams(req.session)
        .then(function (params) {
            return res.render('testPage', {
                params: params
            });
        })
        .catch(function (E) {
            return res.badRequest('Broken: ', E);
        });
    },
    managerUpdatePage: function (req, res) {
        returnParams(req.session)
        .then(function (params) {
            var inputId = parseInt(req.params.id);
            var managerToUpdate;

            params.managers.forEach(function (manager) {
                if (manager.id === inputId) {
                    managerToUpdate = manager;
                }
            });
            return res.render('managerUpdatePage', {
                manager: managerToUpdate,
                params: params
            });
        })
        .catch(function (E) {
            return res.badRequest('Broken: ', E);
        });
    }
};
