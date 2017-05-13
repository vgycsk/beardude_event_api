'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = {
    attributes: {
        events: {
            collection: 'Event',
            via: 'racers'
        },
        races: {
            collection: 'Race',
            via: 'racers'
        },
        rfid: {
            collection: 'Rfid',
            via: 'racer'
        },

        address: {
            model: 'Address'
        },

        email: {
            type: 'email',
            required: true,
            unique: true
        },
        phone: {
            type: 'string'
        },
        picture: {
            model: 'Image'
        },
        firstName: {
            type: 'string',
            required: true
        },
        lastName: {
            type: 'string',
            required: true
        },
        birthday: {
            type: 'date'
        },
        idNumber: {
            type: 'string',
            unique: true
        },
        password: {
            type: 'string',
            required: true
        },
        isActive: {
            type: 'boolean',
            required: true
        },
        // Generate when registering for events. Use this to generate QR Code for check-in
        checkinKey: {
            type: 'string',
            defaultsTo: ''
        }
    },
    beforeCreate: function (values, callback) {
        if (values.password && values.password !== 'init') {
            return bcrypt.hash(values.password, null, null, function (err, hash) {
                if (err) {
                    return callback(err);
                }
                values.password = hash;
                return callback();
            });
        }
        return callback();
    },
    beforeUpdate: function (values, callback) {
        if (values.password && values.password !== 'init') {
            // When user updating password
            return bcrypt.hash(values.password, null, null, function (err, hash) {
                if (err) {
                    return callback(err);
                }
                values.password = hash;
                return callback();
            });
        }
        return callback();
    }
};
