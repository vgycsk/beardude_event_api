'use strict';

// Sub races within an event
module.exports = {
    attributes: {
        managers: {
            collection: 'Manager',
            via: 'races',
            dominant: true
        },
        racers: {
            collection: 'Racer',
            via: 'races',
            dominant: true
        },

        event: {
            model: 'Event'
        },
        name: {
            type: 'string',
            required: true
        },
        records: {
            type: 'json',
            defaultsTo: {}
        }
    }
};
