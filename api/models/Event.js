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
    isTeamRegistrationOpen: {
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
    requiresPaymentOnReg: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    pacerEpc: {
      type: 'string'
    },
    // [{epc:1 time: ms}, {}, {}]
    rawRfidData: {
      type: 'array',
      defaultsTo: []
    },
    ongoingRace: {
      type: 'integer',
      defaultsTo: -1
    },
    resultLatency: {
      type: 'integer',
      defaultsTo: 0
    },
    toJSON: function () {
      return this.toObject()
    }
  }
}
