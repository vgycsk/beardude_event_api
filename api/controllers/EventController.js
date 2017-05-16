/* global _, dataService, Event, Manager */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;
        var resultObj;

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
        groups: [ID1, ID2]
    } */
    addGroups: function (req, res) {
        var input = req.body;
        var groupsToAdd;

        input.groups.forEach(function (group, index) {
            input.groups[index] = parseInt(group);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('groups')
        .then(function(eventData) {
            groupsToAdd = _.difference(input.groups, eventData.groups);
            if (groupsToAdd.length === 0) {
                throw new Error('No groups to add');
            }
            groupsToAdd.forEach(function (inputGroup) {
                eventData.groups.add(inputGroup);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Groups added to event',
                event: input.event,
                groups: groupsToAdd
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /* {
        event: ID,
        groups: [ID1, ID2]
    } */
    removeGroups: function (req, res) {
        var input = req.body;
        var groupsToRemove;

        input.groups.forEach(function (groups, index) {
            input.groups[index] = parseInt(groups);
        });
        Event.findOne({
            id: parseInt(input.event)
        })
        .populate('groups')
        .then(function(eventData) {
            groupsToRemove = _.intersection(input.groups, eventData.groups);
            if (groupsToRemove.length === 0) {
                throw new Error('No groups to remove');
            }
            groupsToRemove.forEach(function (groupId) {
                eventData.groups.remove(groupId);
            });
            return eventData.save();
        })
        .then(function () {
            return res.ok({
                message: 'Groups removed from event',
                event: input.event,
                groups: groupsToRemove
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
    // {event: ID, isPublic: BOOL}
    updateIsPublic: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.event)
        };
        var updateObj = {
            isPublic: false
        };

        if (input.isPublic && input.isPublic !== '') {
            updateObj.isPublic = true;
        }
        Event.update(query, updateObj)
        .then(function (modelData) {
            return res.ok({
                message: 'Event isPublic updated',
                event: modelData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
