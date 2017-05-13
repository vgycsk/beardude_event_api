/* global dataService, Event, Manager */

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
            eventData.managers.forEach(function (dataManager) {
                input.managers.forEach(function (inputManager) {
                    if (dataManager.id === inputManager) {
                        throw new Error('Already a manager of the event');
                    }
                });
            });
            input.managers.forEach(function (inputManager) {
                var managerId = inputManager;

                eventData.managers.add(managerId);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Manager added to event',
                event: input.event,
                managers: input.managers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
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
            input.managers.forEach(function (inputManager) {
                var found;

                eventData.managers.forEach(function (dataManager) {
                    if (dataManager.id === inputManager) {
                        found = true;
                    }
                });
                if (!found) {
                    throw new Error('Not a manager of the event: ', inputManager);
                }
            });
            input.managers.forEach(function (managerId) {
                eventData.managers.remove(managerId);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Manager removed from event',
                event: input.event,
                managers: input.managers
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    update: function (req, res) {
        var input = req.body;
        var updateObj;
        var fields = ['name', 'nameCht', 'startTime', 'endTime', 'location', 'isPublic', 'isRegisterOpen'];
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
    }
};
