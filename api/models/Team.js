'use strict';

module.exports = {
    attributes: {
        racers: {
            collection: 'Racer',
            via: 'team'
        },
        racersApplication: {
            collection: 'Racer',
            via: 'teamApplication'
        },

        leader: {
            model: 'Racer'
        },
        name: {
            type: 'string',
            required: true
        },
        uniqueName: {
            type: 'string',
            unique: true
        },
        description: {
            type: 'string'
        },
        url: {
            type: 'string'
        }
    }
};
