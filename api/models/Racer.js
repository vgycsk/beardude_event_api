'use strict';

var bcrypt = require('bcrypt-nodejs');

// 選手資料
module.exports = {
    attributes: {
        registrations: {
            collection: 'Registration',
            via: 'racer'
        },

        address: {
            model: 'Address'
        },
        team: {
            model: 'Team'
        },
        //申請轉隊
        teamApplication: {
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
        nickName: {
            type: 'string'
        },
        birthday: {
            type: 'date'
        },
        idNumber: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        isActive: {
            type: 'boolean',
            required: true
        }
    },
    beforeCreate: function (values, callback) {
        if (values.password && values.password !== '') {
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
        if (values.password && values.password !== '') {
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
