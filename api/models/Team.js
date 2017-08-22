'use strict'

// 比賽隊伍
module.exports = {
  attributes: {
    racers: {
      collection: 'Racer',
      via: 'team'
    },
    racerIds: {
      type: 'array',
      defaultsTo: []
    },
    leader: {
      model: 'Racer'
    },

    name: {
      type: 'string',
      required: true,
      unique: true
    },
    nameCht: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    url: {
      type: 'string'
    }
  }
}
