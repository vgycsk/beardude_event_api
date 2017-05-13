'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = {
    attributes: {
        events: {
            collection: 'Event',
            via: 'managers'
        },
        races: {
            collection: 'Race',
            via: 'managers'
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
            type: 'string',
            required: true,
            unique: true
        },
        firstName: {
            type: 'string',
            required: true
        },
        lastName: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        },
        isActive: {
            type: 'boolean',
            required: true
        }
    },
    beforeCreate: function (values, callback) {
        if (values.password) {
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
        if (values.password) {
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
