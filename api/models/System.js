'use strict'

// 活動
module.exports = {
  attributes: {
    key: {
      type: 'integer',
      defaultsTo: 0
    },
    ongoingEvent: {
      type: 'string',
      defaultsTo: ''
    },
    ongoingRace: {
      type: 'string',
      defaultsTo: ''
    },
    testIntervalMs: {
      type: 'integer',
      defaultsTo: 1000
    },
    validIntervalMs: {
      type: 'integer',
      defaultsTo: 10000
    },
    slaveEpcMap: {
      type: 'json',
      defaultsTo: {}
    },
    resultLatency: {
      type: 'integer',
      defaultsTo: 0
    }
  }
}
