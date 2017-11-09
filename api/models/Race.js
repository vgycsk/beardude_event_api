'use strict'

// 分組裡面的個別賽事
module.exports = {
  attributes: {
    registrationIds: {
      type: 'array',
      defaultsTo: []
    },

    event: {
      model: 'Event'
    },
    group: {
      model: 'Group'
    },

    name: {
      type: 'string',
      required: true
    },
    nameCht: {
      type: 'string'
    },
    laps: {
      type: 'integer',
      required: true
    },
    racerNumberAllowed: {
      type: 'integer',
      required: true
    },
    // 晉級規則, 空的代表是決賽, 比完直接將結果張貼至 Group model的 result
    // [{ rankFrom: 0, rankTo: 9, toRace: 2, insertAt: 0 }]
    advancingRules: {
      type: 'array',
      defaultsTo: []
    },
    isEntryRace: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    isFinalRace: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    requirePacer: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    pacerEpc: {
      type: 'string'
    },
    pacerEpcSlave: {
      type: 'string'
    },
    startTime: {
      type: 'integer'
    },
    endTime: {
      type: 'integer'
    },
    submitTime: {
      type: 'integer'
    },
    // init, started, ended, submitted. (TO DO: paused)
    raceStatus: {
      type: 'string',
      defaultsTo: 'init'
    },
    recordsRaw: {
      type: 'array',
      defaultsTo: []
    },
    // {EPC_1: [time1, time2], EPC_2: [time1, time2]}
    recordsHashTable: {
      type: 'json',
      defaultsTo: {}
    },
    // [ { epc: STR, registration: ID, sum: timeMs, laps: INT, lapRecords: [Ms, Ms], advanceTo: ID } ]
    result: {
      type: 'array',
      defaultsTo: []
    },
    // {EPC_1: [index1, index2]}
    slaveEpcStat: {
      type: 'json',
      defaultsTo: {}
    },
    toJSON: function () {
      var obj = this.toObject()

      delete obj.createdAt
      delete obj.updatedAt
      return obj
    }
  }
}
