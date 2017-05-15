'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = {
    attributes: {
        address: {
            model: 'Address'
        },
        team: {
            model: 'Team'
        },

        email: {
            type: 'email',
            required: true,
            unique: true
        },
        phone: {
            type: 'string'
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
