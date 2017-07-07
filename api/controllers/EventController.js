/* global _, dataService, Event, Group, Manager */

'use strict';

var moment = require('moment');
var Q = require('q');

module.exports = {
    // {name: STR, nameCht: STR, assignedRaceNumber: INT, startTime: DATETIME, endTime: DATETIME, lapDistance: INT, location: STR}
    create: function (req, res) {
        var input = req.body;
        var resultObj;

        input.startTime = moment(input.startTime).valueOf();
        input.endTime = moment(input.endTime).valueOf();
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
    getEvents: function (req, res) {
        Event.find({})
        .then(function (modelData) {
            return res.ok({
                events: modelData
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
//        .populate('managers')
        .populate('groups')
        .then(function (modelData) {
            return res.ok({
              event: modelData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /*
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
    */
    // {id: ID}
    update: function (req, res) {
        var input = req.body;
        var updateObj;
        var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isRegistrationOpen', 'isTeamRegistrationOpen', 'isPublic'];
        var query = {
            id: parseInt(input.id)
        };

        Event.findOne(query)
        .then(function (eventData) {
            updateObj = dataService.returnUpdateObj(fields, input, eventData);
            if (updateObj.startTime) {
                updateObj.startTime = moment(updateObj.startTime).valueOf();
            }
            if (updateObj.endTime) {
                updateObj.endTime = moment(updateObj.endTime).valueOf();
            }
            return Event.update(query, updateObj);
        })
        .then(function () {
            return Event.findOne(query)
    //        .populate('managers')
            .populate('groups');
        })
        .then(function (modelData) {
            return res.ok({
              event: modelData
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
            id: input.event
        })
        .populate('groups')
        .then(function (modelData) {
            var rfidExist;

            testerEpc = modelData.testerEpc;
            rfidExist = _.includes(testerEpc, input.epc);
            if (rfidExist) {
                throw new Error('Tester RFID already assigned');
            }
            testerEpc.push(input.epc);
            return Event.update({
                id: input.event
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
    },
    delete: function (req, res) {
        var query = {
            id: parseInt(req.params.id)
        };
        var groupIds = [];

        Event.findOne(query)
        .populate('groups')
        .then(function (modelData) {
            var startTime = modelData.startTime;
            var endTime = modelData.endTime;
            var now = moment().valueOf();

            if (modelData.isPublic) {
                throw new Error('Cannot delete a public event');
            }
            if (now > startTime && now < endTime) {
                throw new Error('Cannot delete an ongoing event');
            }
            return Group.find({
                event: query.id
            });
        })
        .then(function (groupData) {
            if (groupData) {
                throw new Error('Cannot delete an event that contains group');
            }
            return Event.destroy(query);
        })
        .then(function () {
            return res.ok({
                message: 'Event deleted',
                event: query.id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
