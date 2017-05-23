/* global _, dataService, Event, Manager */

'use strict';

module.exports = {
    // {name: STR, nameCht: STR, assignedRaceNumber: INT, startTime: DATETIME, endTime: DATETIME, lapDistance: INT, location: STR}
    create: function (req, res) {
        var input = req.body;
        var resultObj;

        input.isPublic = false;
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
    getGeneralInfo: function (req, res) {
        Event.findOne({
            id: parseInt(req.params.id)
        })
        .populate('managers')
        .populate('groups')
        .then(function (modelData) {
            return res.ok(modelData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, managers: [ID1, ID2]}
    addManagers: function (req, res) {
        var input = req.body;
        var managersToAdd = [];

        input.managers.forEach(function (manager, index) {
            input.managers[index] = parseInt(manager);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('managers')
        .then(function(eventData) {
            managersToAdd = _.difference(input.managers, eventData.managers);

            if (managersToAdd.length === 0) {
                throw new Error('No managers to add');
            }
            managersToAdd.forEach(function (inputManager) {
                eventData.managers.add(inputManager);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Managers added to event',
                event: input.event,
                managers: managersToAdd
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, managers: [ID1, ID2]}
    removeManagers: function (req, res) {
        var input = req.body;
        var managersToRemove = [];

        input.managers.forEach(function (manager, index) {
            input.managers[index] = parseInt(manager);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('managers')
        .then(function(eventData) {
            managersToRemove = _.intersection(input.managers, eventData.managers);

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
                managers: managersToRemove
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID}
    update: function (req, res) {
        var input = req.body;
        var updateObj;
        var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location'];
        var query = {
            id: parseInt(input.event)
        };

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
    // {event: ID, isRegistrationOpen: BOOL, isTeamRegistrationOpen, BOOL, isPublic: BOOL}
    updateSwitch: function (req, res) {
        var fields = ['isRegistrationOpen', 'isTeamRegistrationOpen', 'isPublic'];
        var input = req.body;
        var query = {
            id: parseInt(input.group)
        };
        var updateObj = {};

        fields.forEach(function (field) {
            if (input[field] && input[field] !== '') {
                updateObj[field] = true;
            } else {
                updateObj[field] = false;
            }
        });
        Event.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Event boolean field(s) updated',
                event: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, epc: STR}
    // copy to all races
    assignTesterRfid: function (req, res) {
        var input = req.body;
        var testerEpc;

        input.race = parseInt(input.event);
        Event.findOne({
            id: input.id
        })
        .populate('groups')
        .then(function (modelData) {
            var rfidExist;

            rfidExist = _.includes(testerEpc, input.epc);
            if (rfidExist) {
                throw new Error('Tester RFID already assigned');
            }
            testerEpc = modelData.testerEpc;
            testerEpc.push(input.epc);
            return Event.update({
                id: input.id
            }, {
                testerEpc: testerEpc
            });
        })
        .then(function () {
            return res.ok({
                message: 'Tester registered',
                event: input.event,
                epc: input.epc
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
