'use strict';

module.exports.policies = {
    EventController: {
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isActiveManager',
        update: 'isActiveManager'
    },
    ManagerController: {
        activate: 'isInactive',
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isManagerSelf',
//        login: '',
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
//        login: '',
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
