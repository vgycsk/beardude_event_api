'use strict'

// 分組. 例如 公路車: 男, 單速車: 混合
module.exports = {
  attributes: {
    event: {
      model: 'Event'
    },
    name: {
      type: 'string',
      required: true
    },
    nameCht: {
      type: 'string',
      required: true
    },
    racerNumberAllowed: {
      type: 'integer'
    }
  }
}
