'use strict';

module.exports.policies = {
    EventController: {
      create: 'isActiveManager',
//        getGeneralInfo: '',
      getManagementInfo: 'isActiveManager',
      getEvents: 'isActiveManager',
//        addManagers: 'isActiveManager',
//        removeManagers: 'isActiveManager',
      getGroupsAndRacersOfEvent: 'isActiveManager',
      update: 'isActiveManager',
      delete: 'isActiveManager',
      rfidReg: 'isActiveManager',
      rfidTester: 'isActiveManager',
      rfidPacer: 'isActiveManager',
      rfidRecycle: 'isActiveManager'
    },
    GroupController: {
        create: 'isActiveManager',
//        getInfo: '',
        update: 'isActiveManager',
        delete: 'isActiveManager'
    },
    ManagerController: {
        activate: 'isInactive',
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getManagers: 'isActiveManager',
        getManagementInfo: 'isActiveManager',
        login: 'isNotLoggedInManager',
//        logout: '',
//        reissuePassword: ''
        update: 'isActiveManager',
        updatePassword: 'isActiveManager'
    },
    RaceController: {
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isActiveManager',
        update: 'isActiveManager',
        delete: 'isActiveManager',
        assignRacers: 'isActiveManager',
        getParsedRaceResult: 'isActiveManager',
        submitRaceResult: 'isActiveManager'
    },
    RacerController: {
        activate: 'isInactive',
//        create: '',
//        getGeneralInfo: '',
        getRacers: 'isActiveManager',
        getManagementInfo: 'isRacerSelfOrTeamLeaderOrManager',
        login: 'isNotLoggedInRacer',
//        logout: '',
//        reissuePassword: ''
        update: 'isRacerSelfOrTeamLeaderOrManager',
        updatePassword: 'isRacerSelfOrTeamLeaderOrManager'
    },
    RegistrationController: {
//        createReg: 'isActiveManager',
//        signupAndCreate: '',
//        signupAndCreateMultiple: '',
//        create: '',
        getInfo: 'isRacerSelfOrTeamLeaderOrManager',
        getRegistrations: 'isActiveManager',
        confirmRegistration: 'isActiveManager',
        update: 'isActiveManager',
        updateDisqualification: 'isActiveManager',
        updateRaceNote: 'isActiveManager',
        delete: 'isActiveManager'
    },
    TeamController: {
//        teamExist: '',
//        create: '',
//        getInfo: '',
        update: 'isTeamLeaderOrManager'
    }
};
