'use strict';

module.exports = {
    attributes: {
        epc: {
            type: 'string',
            required: true
        },
        event: {
            model: 'Event'
        },
        racer: {
            model: 'Racer'
        },
        isRecycled: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};
