'use strict'

// 分組裡面的個別賽事
module.exports = {
  attributes: {
    registrations: {
      collection: 'Registration',
      via: 'races'
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
      defaultsTo: true
    },
    requirePacer: {
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    pacerEpc: {
      type: 'string'
    },
    testerEpc: {
      type: 'array',
      defaultsTo: []
    },
        // moment().format("YYYY-MM-DD HH:mm:ss")
    startTime: {
      type: 'integer'
    },
    endTime: {
      type: 'integer'
    },
        // [{epc:1 time: ms}, {}, {}]
    rfidData: {
      type: 'array'
    },
        // {EPC_1: [time1, time2], EPC_2: [time1, time2]}
        // 輸入的資料必須validate過, 可以直接用來計算結果 (1. 時間間隔合理 2. 沒有被套圈)
        // 被套圈的寫: 'dnf'
    recordsHashTable: {
      type: 'json',
      defaultsTo: {}
    },
        // [{registration: 1, time: hh:mm:ss}, {}, {}]
    result: {
      type: 'array'
    },
    toJSON: function () {
      var obj = this.toObject()

      delete obj.createdAt
      delete obj.updatedAt
      return obj
    }
  }
}
