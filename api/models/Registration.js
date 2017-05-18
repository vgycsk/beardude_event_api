'use strict';

// 註冊比賽的選手賽籍
module.exports = {
    attributes: {
        races: {
            collection: 'Race',
            via: 'registrations',
            dominant: true
        },

        event: {
            model: 'Event'
        },
        group: {
            model: 'Group'
        },
        racer: {
            model: 'Racer'
        },
        // 每個Event裡的所有accessCode為unique
        accessCode: {
            type: 'string',
            required: true
        },
        raceNumber: {
            type: 'integer'
        },
        epc: {
            type: 'string',
            defaultsTo: ''
        },
        paid: {
            type: 'boolean',
            required: true,
            defaultsTo: false
        },
        rfidRecycled: {
            type: 'boolean',
            required: true,
            defaultsTo: false
        },
        refundRequested: {
            type: 'boolean',
            defaultsTo: false
        },
        refunded: {
            type: 'boolean',
            defaultsTo: false
        },
        isDisqualified: {
            type: 'boolean',
            defaultsTo: false
        },
        // {race: ID, note: STR}
        raceNotes: {
            type: 'json'
        },
        toPublic: function () {
            var obj = this.toObject();

            delete obj.refunded;
            delete obj.accessCode;
            delete obj.epc;
            delete obj.rfidRecycled;
            delete obj.refundRequested;
            delete obj.refunded;
        }
    }
};
