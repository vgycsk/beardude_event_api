'use strict';

// A bicycle race event, which may consist of a number of races
module.exports = {
    attributes: {
        managers: {
            collection: 'Manager',
            via: 'events',
            dominant: true
        },
        races: {
            collection: 'Race',
            via: 'event'
        },
        racers: {
            collection: 'Racer',
            via: 'events',
            dominant: true
        },

        address: {
            model: 'Address'
        },
        picture: {
            model: 'Image'
        },

        name: {
            type: 'string',
            required: true
        },
        nameCht: {
            type: 'string',
            required: true
        },
        startTime: {
            type: 'date',
            required: true
        },
        endTime: {
            type: 'date',
            required: true
        },

        isPublic: {
            type: 'boolean',
            required: true
        },
        isRegisterationOpen: {
            type: 'boolean',
            required: true
        }
    }
};
