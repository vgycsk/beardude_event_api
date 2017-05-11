/* eslint-disable no-console */
/* global Event, Manager */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;

        Event.create(input)
        .then(function (eventData) {
            return res.ok(eventData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getGeneralInfo: function (req, res) {
        Event.findOne({
            id: req.params.id
        })
        .populate('address')
        .populate('races')
        .then(function (eventData) {
            return res.ok(eventData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getManagementInfo: function (req, res) {
        Event.findOne({
            id: req.params.id
        })
        .populate('address')
        .populate('races')
        .then(function (eventData) {
            return res.ok(eventData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    update: function (req, res) {
        //name, startTime, endTime, manager (check), isActive
        var input = req.body;
        var updateObj = {};
        var fields = ['name', 'startTime', 'endTime', 'manager', 'isPublic', 'isRegisterOpen'];
        var i;

        for (i = 0; i < fields.length; i += 1) {
            if (typeof input[fields[i]] !== 'undefined') {
                updateObj[i] = fields[i];
            }
        }
        if (updateObj.manager) {
            Manager.findOne({
                id: updateObj.manager
            })
            .then(function (managerData) {
                if (typeof managerData === 'undefined') {
                    delete updateObj.manager;
                }
                return Event.update({
                    id: input.id
                }, updateObj);
            })
            .then(function (eventData) {
                return res.ok(eventData[0]);
            });
        }
        Event.update({
            id: input.id
        }, updateObj)
        .then(function (eventData) {
            return res.ok(eventData[0]);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
