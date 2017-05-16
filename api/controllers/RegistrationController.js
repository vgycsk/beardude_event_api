/* global Registration */

'use strict';

module.exports = {
    // {group: ID, racer: ID}
    create: function (req, res) {
        var input = {
            group: parseInt(req.body.group),
            racer: parseInt(req.body.racer)
        };

        Registration.findOne(input)
        .then(function (modelData) {
            if (modelData) {
                throw new Error('Already registered');
            }
            return Registration.create(input);
        })
        .then(function () {
            return res.ok({
                message: 'Registered successfully',
                group: input.group,
                racer: input.racer
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {registration: ID, group: ID, epc: STR}
    assignRfid: function (req, res) {
        var input = req.body;

        input.registration = parseInt(input.registration);
        input.group = parseInt(input.group);

        Registration.findOne({
            id: input.registration
        })
        .then(function (modelData) {
            if (modelData.epc && modelData.epc !== '') {
                throw new Error('Racer already has RFID');
            }
            // Validate if rfid already assigned in this group
            return Registration.findOne({
                group: input.group,
                epc: input.epc
            });
        })
        .then(function (modelData) {
            if (modelData) {
                throw new Error('RFID already assigned to another racer');
            }
            return Registration.update({
                id: input.registration
            }, {
                epc: input.epc
            });
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Rfid assigned',
                registration: modelData[0].id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {registration: ID, group: ID, epc: STR}
    replaceRfid: function (req, res) {
        var input = req.body;

        input.registration = parseInt(input.registration);
        input.group = parseInt(input.group);
        Registration.findOne({
            id: input.registration
        })
        .then(function (modelData) {
            if (!modelData.epc || modelData.epc === '') {
                throw new Error('Racer not assigned RFID yet');
            }
            // Validate if rfid already assigned in this group
            return Registration.findOne({
                group: input.group,
                epc: input.epc
            });
        })
        .then(function (modelData) {
            if (modelData) {
                throw new Error('RFID already assigned to another racer');
            }
            return Registration.update({
                id: input.registration
            }, {
                epc: input.epc
            });
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Rfid assigned',
                registration: modelData[0].id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {epc: STR}
    recycleRfid: function (req, res) {
        var query = {
            epc: req.body.epc
        };

        Registration.update(query, {
            rfidRecycled: true
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Rfid recycled',
                registration: modelData[0].id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {registration: ID, paid: BOOL}
    updatePayment: function (req, res) {
        var input = req.body;
        var query = {
            registration: parseInt(input.registration)
        };
        var updateObj = {
            paid: false
        };

        if (input.paid && input.paid !== '') {
            updateObj.paid = true;
        }
        Registration.findOne(query)
        .then(function (modelData) {
            if (modelData.paid === updateObj.paid) {
                throw new Error('Payment status unchange');
            }
            return Registration.update(query, updateObj);
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Payment status changed',
                registration: modelData[0].id
            });
        });
    }
};
