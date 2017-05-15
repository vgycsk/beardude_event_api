'use strict';

module.exports = {
    attributes: {
        races: {
            collection: 'Race',
            via: 'registrations',
            dominant: true
        },

        group: {
            model: 'Group'
        },
        racer: {
            model: 'Racer'
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
        }
    }
};
