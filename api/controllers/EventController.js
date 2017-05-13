/* global _, dataService, Event, Manager */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;
        var resultObj;

        if (input.isRegisterationOpen && input.isRegisterationOpen !== '') {
            input.isRegisterationOpen = true;
        } else {
            input.isRegisterationOpen = false;
        }
        if (input.isPublic && input.isPublic !== '') {
            input.isPublic = true;
        } else {
            input.isPublic = false;
        }
        Event.create(input)
        .then(function (eventData) {
            resultObj = eventData;
            return Manager.findOne({
                id: req.session.managerInfo.id
            })
            .populate('events');
        })
        .then(function (managerData) {
            managerData.events.add(resultObj.id);
            return managerData.save();
        })
        .then(function () {
            resultObj.managers = [req.session.managerInfo.id];
            return res.ok({
                message: 'Event created',
                event: resultObj
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getInfo: function (req, res) {
        Event.findOne({
            id: parseInt(req.params.id)
        })
        .populate('managers')
        .populate('races')
        .populate('racers')
        .then(function (eventData) {
            return res.ok(eventData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /* {
        event: ID,
        managers: [ID1, ID2]
    } */
    addManagers: function (req, res) {
        var input = req.body;

        input.managers.forEach(function (manager, index) {
            input.managers[index] = parseInt(manager);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('managers')
        .then(function(eventData) {
            var managersToAdd = _.difference(input.managers, eventData.managers);

            managersToAdd.forEach(function (inputManager) {
                eventData.managers.add(inputManager);
            });
            if (managersToAdd.length === 0) {
                throw new Error('No managers to add');
            }
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Managers added to event',
                event: input.event,
                managers: input.managers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /* {
        event: ID,
        managers: [ID1, ID2]
    } */
    removeManagers: function (req, res) {
        var input = req.body;

        input.managers.forEach(function (manager, index) {
            input.managers[index] = parseInt(manager);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('managers')
        .then(function(eventData) {
            var managersToRemove = _.intersection(input.managers, eventData.managers);

            if (managersToRemove.length === 0) {
                throw new Error('No managers to remove');
            }
            managersToRemove.forEach(function (managerId) {
                eventData.managers.remove(managerId);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Managers removed from event',
                event: input.event,
                managers: input.managers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /* {
        event: ID,
        racers: [ID1, ID2]
    } */
    addRacers: function (req, res) {
        var input = req.body;

        input.racers.forEach(function (racer, index) {
            input.racers[index] = parseInt(racer);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('racers')
        .then(function(eventData) {
            var racersToAdd = _.difference(input.racers, eventData.racers);

            if (racersToAdd.length === 0) {
                throw new Error('No racers to add');
            }
            racersToAdd.forEach(function (inputRacer) {
                eventData.racers.add(inputRacer);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racers added to event',
                event: input.event,
                racers: input.racers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /* {
        event: ID,
        racers: [ID1, ID2]
    } */
    removeRacers: function (req, res) {
        var input = req.body;

        input.racers.forEach(function (racer, index) {
            input.racers[index] = parseInt(racer);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('racers')
        .then(function(eventData) {
            var racersToRemove = _.intersection(input.racers, eventData.racers);

            if (racersToRemove.length === 0) {
                throw new Error('No racers to remove');
            }
            racersToRemove.forEach(function (racerId) {
                eventData.racers.remove(racerId);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Racers removed from event',
                event: input.event,
                racers: input.racers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    update: function (req, res) {
        var input = req.body;
        var updateObj;
        var fields = ['name', 'nameCht', 'startTime', 'endTime', 'location', 'racerNumber', 'isPublic', 'isRegisterOpen', 'isCheckinOpen'];
        var query = {
            id: parseInt(input.id)
        };

        if (input.isRegisterationOpen && input.isRegisterationOpen !== '') {
            input.isRegisterationOpen = true;
        } else {
            input.isRegisterationOpen = false;
        }
        if (input.isPublic && input.isPublic !== '') {
            input.isPublic = true;
        } else {
            input.isPublic = false;
        }
        input.racerNumber = parseInt(input.racerNumber);
        Event.findOne(query)
        .then(function (eventData) {
            updateObj = dataService.returnUpdateObj(fields, input, eventData);
            return Event.update(query, updateObj);
        })
        .then(function (eventData) {
            return res.ok({
                message: 'Event updated',
                event: eventData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    checkInComplete: function (req, res) {
        // 1. update event model
        // 2. read race rule and assign racers to races
        return res.ok({
            message: 'ok'
        });
    }
};
