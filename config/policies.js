'use strict';

module.exports.policies = {
    EventController: {
      create: 'isManager',
//    getEvents: '',
//    getInfo: '',
      update: 'isManager',
      delete: 'isManager'
    },
    GroupController: {
        create: 'isManager',
//        getInfo: 'isManager',
        update: 'isManager',
        delete: 'isManager'
    },
    ManagerController: {
//        activate: 'isInactive',
        create: 'isManager',
//        getGeneralInfo: '',
        getManagers: 'isManager',
        getManagementInfo: 'isManager',
        login: 'isNotLoggedIn',
//        logout: '',
//        reissuePassword: ''
        update: 'isManager',
        updatePassword: 'isManager'
    },
    RaceController: {
        create: 'isManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isManager',
        update: 'isManager',
        delete: 'isManager',
        assignRegsToRaces: 'isManager',
        startRace: 'isManager',
        resetRace: 'isManager',
        endRace: 'isManager',
        submitResult: 'isManager',
        socketManagement: 'isManager'
//      socket: '',
//      socketImpinj: ''
    },
    RacerController: {
//        activate: '',
//        create: '',
//        getGeneralInfo: '',
        getManagementInfo: ['isRacerSelf', 'isManager', 'isTeamLeader'],
//        getRacers: '',
        login: 'isNotLoggedIn',
//        logout: '',
//        reissuePassword: ''
        update: ['isRacerSelf', 'isManager', 'isTeamLeader']
    },
    RegistrationController: {
//        createReg: 'isManager',
//        signupAndCreate: '',
//        signupAndCreateMultiple: '',
//        create: '',
//        getInfo: '',
        confirmRegistration: 'isManager',
        update: 'isManager',
        updateRaceNote: 'isManager',
        delete: 'isManager'
    },
    TeamController: {
//        teamExist: '',
//        create: '',
//        getInfo: '',
        update: ['isManager', 'isTeamLeader']
    }
};
