'use strict';

module.exports.policies = {
    AddressController: {
        create: ['isActive', 'isLoggedIn'],
        update: ['isActive', 'isLoggedIn']
    },
    EventController: {
        create: ['isActive', 'isManager'],
//        getGeneralInfo: '',
        getManagementInfo: ['isActive', 'isManager'],
        update: ['isActive', 'isManager']
    },
    ManagerController: {
        activate: ['isLoggedIn', 'isInactive'],
        create: ['isActive', 'isManager'],
//        getGeneralInfo: '',
        getManagementInfo: 'isManager',
//        login: '',
        logout: 'isManager',
        update: ['isActive', 'isManager']
    },
    RacerController: {
//        create: '',
//        getGeneralInfo: '',
        getManagementInfo: 'isManager',
//        login: '',
        update: ['isActive', 'isLoggedIn']
    },
    RfidController: {
        create: ['isActive', 'isManager'],
        getInfo: ['isActive', 'isManager']
    },
    PageController: {
        managerUpdatePage:  ['isActive', 'isManager']
    }
};
