/* global Rfid */

'use strict';

module.exports = {
    /*
        epc: string
        event: ID
        racer: ID
    */
    assignRfid: function (req, res) {
        var input = req.body;

        input.event = parseInt(input.event);
        input.racer = parseInt(input.racer);
        Rfid.findOne({
            event: input.event,
            racer: input.racer
        })
        .then(function (rfidData) {
            if (rfidData) {
                throw new Error('Racer already has RFID: ', rfidData.epc);
            }
            Rfid.findOne({
                event: input.event,
                epc: input.epc
            });
        })
        .then(function (rfidData) {
            if (rfidData) {
                throw new Error('RFID already assigned to racer: ', rfidData.racer);
            }
            return Rfid.create(input);
        })
        .then(function (RfidData) {
            return res.ok({
                message: 'Rfid assigned',
                rfid: RfidData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /*
        epc: string
        event: ID
        racer: ID
    */
    replaceRfid: function (req, res) {
        var input = req.body;

        Rfid.findOne({
            event: input.event,
            racer: input.racer
        })
        .then(function (rfidData) {
            if (!rfidData) {
                throw new Error('Racer not assigned RFID yet');
            }
            return Rfid.update({
                id: rfidData.id
            }, {
                epc: input.epc
            });
        })
        .then(function (RfidData) {
            return res.ok({
                message: 'Rfid replaced',
                rfid: RfidData[0]
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    /*
        event: ID
        racer: ID
    */
    recycleRfid: function (req, res) {
        var input = req.body;

        Rfid.findOne({
            event: input.event,
            epc: input.epc
        })
        .then(function (rfidData) {
            return Rfid.update({
                id: rfidData.id
            }, {
                isRecycled: true
            });
        })
        .then(function (rfidData) {
            return res.ok({
                message: 'Rfid recycled',
                rfid: rfidData
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
