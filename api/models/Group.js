'use strict';

// 分組. 例如 公路車: 男, 單速車: 混合
module.exports = {
    attributes: {
        registrations: {
            collection: 'Registration',
            via: 'group'
        },
        races: {
            collection: 'Race',
            via: 'group'
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
