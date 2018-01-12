'use strict'

// 活動
module.exports = {
  attributes: {
    uniqueName: {
      type: 'string',
      unique: true,
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    nameCht: {
      type: 'string',
      required: true
    },
        // 時間統一用 timestamp
    startTime: {
      type: 'integer',
      required: true
    },
    endTime: {
      type: 'integer',
      required: true
    },
    // meter
    lapDistance: {
      type: 'integer'
    },
    location: {
      type: 'string'
    },
    raceOrder: {
      type: 'array',
      defaultsTo: []
    },
    isPublic: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    isRegistrationOpen: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    // Doesnt require racer info
    isIndieEvent: {
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    streamingIframe: {
      type: 'string'
    },
    streamingStart: {
      type: 'integer'
    },
    rules: {
      type: 'string'
    },
    registerDesc: {
      type: 'string'
    },
    announcement: {
      type: 'string'
    },
    toJSON: function () {
      return this.toObject()
    }
  }
}
