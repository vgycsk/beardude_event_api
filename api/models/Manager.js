'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = {
    attributes: {
        events: {
            collection: 'Event',
            via: 'manager'
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
        birthday: {
            type: 'string'
        },
        idNumber: {
            type: 'string'
        },
        password: {
            type: 'string',
            required: true
        },
        // Used only when resetting password
        temporaryPassword: {
            type: 'string',
            defaultsTo: ''
        },
        isActive: {
            type: 'boolean',
            required: true
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
        } else if (values.temporaryPassword && values.temporaryPassword !== '') {
            return bcrypt.hash(values.temporaryPassword, null, null, function (err, hash) {
                if (err) {
                    return callback(err);
                }
                values.temporaryPassword = hash;
                return callback();
            });
        }
        return callback();
    }
};
