/* global Rfid */

'use strict';

module.exports = {
    create: function (req, res) {
        var input = req.body;

        Rfid.create(input)
        .then(function (RfidData) {
            return res.ok(RfidData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    getInfo: function (req, res) {
        var input = req.body;

        Rfid.findOne(input)
        .then(function (RfidData) {
            return res.ok(RfidData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};
