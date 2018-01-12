'use strict'

var bcrypt = require('bcrypt-nodejs')

// 選手資料
module.exports = {
  attributes: {
    team: {
      model: 'Team'
    },
    authToken: {
      type: 'string',
      defaultsTo: ''
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
    isLeaderOf: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    toJSON: function () {
      var obj = this.toObject()

      delete obj.password
      delete obj.email
      delete obj.phone
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
