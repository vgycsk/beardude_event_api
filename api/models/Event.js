'use strict';

// A bicycle race event, which may consist of a number of races
module.exports = {
    attributes: {
        name: {
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
        picture: {
            model: 'Image'
        },
        manager: {
            model: 'Manager'
        },
        address: {
            model: 'Address'
        },
        isPublic: {
            type: 'boolean',
            required: true
        },
        isRegisterationOpen: {
            type: 'boolean',
            required: true
        },
        races: {
            collection: 'Race',
            via: 'event'
        },
        racers: {
            collection: 'Racer',
            via: 'events',
            dominant: true
        }
    }
};
