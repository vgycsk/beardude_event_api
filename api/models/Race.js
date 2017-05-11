'use strict';

// Sub races within an event
module.exports = {
    attributes: {
        event: {
            model: 'Event'
        },
        name: {
            type: 'string',
            required: true
        },
        racers: {
            collection: 'Racer',
            via: 'races',
            dominant: true
        },
        records: {
            type: 'json'
        }
    }
};
