'use strict'

// 活動
module.exports = {
  attributes: {
    key: {
      type: 'integer',
      defaultsTo: 0
    },
    teamRacerCap: {
      type: 'integer',
      defaultsTo: 4
    },
    ongoingRace: {
      type: 'string',
      defaultsTo: ''
    },
    ongoingRaceWithLatency: {
      type: 'string',
      defaultsTo: ''
    },
    testIntervalMs: {
      type: 'integer',
      defaultsTo: 1000
    },
    // (場地(km) / 時速 100) x 3600 (秒)
    validIntervalMs: {
      type: 'integer',
      defaultsTo: 20000
    },
    // {EPC_1_SLAVE: EPC_1, EPC_2_SLAVE: EPC_2 ...}
    slaveEpcMap: {
      type: 'json',
      defaultsTo: {}
    },
    // 比賽發佈延遲. 預設30秒
    resultLatency: {
      type: 'integer',
      defaultsTo: 30000
    },
    recordsHashTable: {
      type: 'json',
      defaultsTo: {}
    },
    // {EPC_1: [index1, index2]}
    slaveEpcStat: {
      type: 'json',
      defaultsTo: {}
    },
    toJSON: function () {
      return this.toObject()
    }
  }
}
