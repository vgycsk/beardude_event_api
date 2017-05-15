'use strict';

// 分組. 例如 公路車: 男, 單速車: 混合
module.exports = {
    attributes: {
        races: {
            collection: 'Race',
            via: 'event'
        },
        racers: {
            collection: 'Racer',
            via: 'events',
            dominant: true
        },

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
        isPublic: {
            type: 'boolean',
            required: true
        },
        isRegisterationOpen: {
            type: 'boolean',
            required: true
        }
    }
};
