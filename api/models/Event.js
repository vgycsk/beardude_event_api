'use strict';

// 活動
module.exports = {
    attributes: {
        managers: {
            collection: 'Manager',
            via: 'events',
            dominant: true
        },
        groups: {
            collection: 'Group',
            via: 'event'
        },

        name: {
            type: 'string',
            required: true
        },
        nameCht: {
            type: 'string',
            required: true
        },
        assignedRaceNumber: {
            type: 'integer',
            defaultsTo: 1
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
        location: {
            type: 'string',
            required: true
        },
        isPublic: {
            type: 'boolean',
            required: true
        }
    }
};
