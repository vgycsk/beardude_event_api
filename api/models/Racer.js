'use strict'

var bcrypt = require('bcrypt-nodejs')

// 選手資料
module.exports = {
  attributes: {
    registrations: {
      collection: 'Registration',
      via: 'racer'
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
    nickName: {
      type: 'string'
    },
        // YYYY/MM/DD
    birthday: {
      type: 'string'
    },
    idNumber: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    street: {
      type: 'string',
      defaultsTo: ''
    },
    district: {
      type: 'string',
      defaultsTo: ''
    },
    city: {
      type: 'string',
      defaultsTo: ''
    },
    county: {
      type: 'string',
      defaultsTo: ''
    },
    country: {
      type: 'string',
      defaultsTo: ''
    },
    zip: {
      type: 'string',
      defaultsTo: ''
    },
    isActive: {
      type: 'boolean',
      required: true
    },
    toJSON: function () {
      var obj = this.toObject()

      delete obj.password
      delete obj.createdAt
      delete obj.updatedAt
      return obj
    }
  },
  beforeCreate: function (values, callback) {
    if (values.password && values.password !== '') {
      return bcrypt.hash(values.password, null, null, function (err, hash) {
        if (err) {
          return callback(err)
        }
        values.password = hash
        return callback()
      })
    }
    return callback()
  },
  beforeUpdate: function (values, callback) {
    if (values.password && values.password !== '') {
            // When user updating password
      return bcrypt.hash(values.password, null, null, function (err, hash) {
        if (err) {
          return callback(err)
        }
        values.password = hash
        return callback()
      })
    }
    return callback()
  }
}
