/* eslint-disable no-console */
/* global Address */

'use strict';

var AddressController = {
    create: function (req, res) {
        Address.create(req.body)
        .then(function (addressData) {
            return res.ok(addressData);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    update: function (req, res) {
        var input = req.body;

        Address.update({
            id: input.id
        }, input)
        .then(function (addressData) {
            return res.ok(addressData[0]);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};

module.exports = AddressController;
