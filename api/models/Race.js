'use strict';

// Race within a group
module.exports = {
    attributes: {
        registrations: {
            collection: 'Registration',
            via: 'races'
        },

        group: {
            model: 'Group'
        },

        name: {
            type: 'string',
            required: true
        },
        pacerEpc: {
            type: 'string'
        },
        racerNumberAllowed: {
            type: 'integer',
            required: true
        },
        isCheckinOpen: {
            type: 'boolean',
            required: true,
            defaultsTo: true
        },
        requirePacer: {
            type: 'boolean',
            required: true
        },
        laps: {
            type: 'integer'
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
        advancingRule: {
            type: 'array'
        },
        // [{epc:1 time: ms}, {}, {}]
        rawData: {
            type: 'array'
        },
        // {EPC_1: [time1, time2], EPC_2: [time1, time2]}
        recordsHashTable: {
            type: 'json',
            defaultsTo: {}
        },
        // [{racer: 1, time: ms}, {}, {}]
        result: {
            type: 'array'
        },
        toJSON: function () {
            var obj = this.toObject();

            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
};
