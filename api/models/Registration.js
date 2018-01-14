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
    team: {
      model: 'Team'
    },
    // Event的accessCode為unique
    accessCode: {
      type: 'string',
      required: true
    },
    // indie race 專用
    name: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      required: true,
      unique: true
    },
    phone: {
      type: 'string'
    },
    nickName: {
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
    // unpaid: 0
    // paid: 1
    // requestRefund: 2
    // refunded: 3
    // paidManual: 4
    paymentStatus: {
      type: 'integer',
      defaultsTo: 0
    },
    regNotes: {
      type: 'string',
      defaultsTo: ''
    },
    raceNotes: {
      type: 'string',
      defaultsTo: ''
    },
    toJSON: function () {
      return this.toObject()
    }
  }
}
