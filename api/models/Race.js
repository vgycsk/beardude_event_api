'use strict';

// Sub races within an event
module.exports = {
    attributes: {
        racers: {
            collection: 'Racer',
            via: 'races',
            dominant: true
        },

        event: {
            model: 'Event'
        },
        name: {
            type: 'string',
            required: true
        },
        records: {
            type: 'json',
            defaultsTo: {}
        },
        toJSON: function () {
            var obj = this.toObject();

            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
};
