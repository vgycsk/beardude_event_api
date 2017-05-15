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
        laps: {
            type: 'integer',
            required: true
        },
        racerNumberAllowed: {
            type: 'integer',
            required: true
        },
        // 晉級規則, 空的代表是決賽, 比完直接將結果張貼至 Group model的 result
        advancingRule: {
            type: 'array',
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
        pacerEpc: {
            type: 'string'
        },
        //moment().format("YYYY-MM-DD HH:mm:ss")
        startTime: {
            type: 'datetime'
        },
        endTime: {
            type: 'datetime'
        },
        // [{epc:1 time: ms}, {}, {}]
        rfidData: {
            type: 'array'
        },
        // {EPC_1: [time1, time2], EPC_2: [time1, time2]}
        recordsHashTable: {
            type: 'json',
            defaultsTo: {}
        },
        // [{racer: 1, time: hh:mm:ss}, {}, {}]
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
