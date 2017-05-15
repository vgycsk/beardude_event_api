'use strict';

module.exports = {
    attributes: {
        group: {
            model: 'Group'
        },
        racer: {
            model: 'Racer'
        },

        epc: {
            type: 'string',
            required: true
        },

        isRecycled: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};
