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
        lapDistance: {
            type: 'integer'
        },
        // preparation, race, finalize
        timeTableByMinute: {
            type: 'array',
            required: true
        },
        /*[
            {
                name: '公路車',
                racerCount: 150,
                rounds: 3
            },
            {
                name: '單速車',
                racerCount: 150,
                rounds: 3
            }
        ]*/
        groupsAndRacerAllocation: {
            type: 'json',
            required: true
        },
        location: {
            type: 'string',
            required: true
        },
        isPublic: {
            type: 'boolean',
            required: true
        },
        isRegisterationOpen: {
            type: 'boolean',
            required: true
        },
        isCheckinOpen: {
            type: 'boolean',
            required: true
        }
    }
};
