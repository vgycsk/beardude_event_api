'use strict'

// 註冊比賽的選手賽籍
module.exports = {
  attributes: {
    event: {
      model: 'Event'
    },
    group: {
      model: 'Group'
    },
    racer: {
      model: 'Racer'
    },

    // Event的accessCode為unique
    accessCode: {
      type: 'string',
      required: true
    },
    // indie race 專用
    name: {
      type: 'string'
    },
    raceNumber: {
      type: 'integer'
    },
    epc: {
      type: 'string',
      defaultsTo: ''
    },
    epcSlave: {
      type: 'string',
      defaultsTo: ''
    },
    paid: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    rfidRecycled: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    refundRequested: {
      type: 'boolean',
      defaultsTo: false
    },
    refunded: {
      type: 'boolean',
      defaultsTo: false
    },
    isDisqualified: {
      type: 'boolean',
      defaultsTo: false
    },
    // [{race: ID, note: STR}]
    raceNotes: {
      type: 'json'
    },
    toJSON: function () {
      return this.toObject()
    }
  }
}
