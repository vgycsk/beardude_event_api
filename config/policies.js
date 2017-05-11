'use strict';

module.exports.policies = {
    AddressController: {
        create: 'isLoggedIn',
        update: 'isLoggedIn'
    },
    EventController: {
        create: 'isManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isManager',
        update: 'isManager'
    },
    ManagerController: {
        create: 'isManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isManager',
//        login: '',
        update: 'isManager'
    },
    RacerController: {
//        create: '',
//        getGeneralInfo: '',
        getManagementInfo: 'isManager',
//        login: '',
        update: 'isLoggedIn'
    },
    RfidController: {
        create: 'isManager',
        getInfo: 'isManager'
    }
};
