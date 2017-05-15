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
        racerNumberAllowed: {
            type: 'integer',
            required: true
        },
        isCheckinOpen: {
            type: 'boolean',
            required: true,
            defaultsTo: true
        },
        laps: {
            type: 'integer'
        },
        advancingRule: {
            type: 'array'
        },
        records: {
            type: 'json',
            defaultsTo: {}
        },
        /* [{
            racer: 1,
            time: ms
        }, {}, {}] */
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
