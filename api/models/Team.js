'use strict'

// 比賽隊伍
module.exports = {
  attributes: {
    event: {
      model: 'Event'
    },
    leader: {
      model: 'Registration'
    },
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    description: {
      type: 'string'
    },
    toJSON: function () {
      return this.toObject()
    }
  }
}
