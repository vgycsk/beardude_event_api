'use strict';

module.exports = {
    attributes: {
        name: {
            type: 'string'
        },
        racers: {
            collection: 'Racer',
            via: 'team'
        },
        leader: {
            model: 'Racer'
        }
    }
};
