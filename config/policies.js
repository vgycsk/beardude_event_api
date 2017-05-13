'use strict';

module.exports.policies = {
    EventController: {
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getInfo: 'isActiveManager',
        addRacers: 'isActiveManager',
        removeRacers: 'isActiveManager',
        update: 'isActiveManager'
    },
    ManagerController: {
        activate: 'isInactive',
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isManagerSelf',
        login: 'isNotLoggedIn',
        logout: 'isManager',
//        reissuePassword: ''
        update: 'isActiveManager',
        updatePassword: 'isActiveManager'
    },
    RacerController: {
        activate: 'isInactive',
//        create: '',
//        getGeneralInfo: '',
        getManagementInfo: 'isRacerSelfOrManager',
        login: 'isNotLoggedIn',
        logout: 'isRacer',
//        reissuePassword: ''
        update: 'isActiveRacer',
        updatePassword: 'isActiveRacer'
    },
    RfidController: {
        create: 'isActiveManager',
        getInfo: 'isActiveManager'
    }
};
