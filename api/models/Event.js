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

        picture: {
            model: 'Image'
        },

        location: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        nameCht: {
            type: 'string',
            required: true
        },
        //moment().format("YYYY-MM-DD HH:mm:ss")
        startTime: {
            type: 'datetime',
            required: true
        },
        endTime: {
            type: 'datetime',
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
