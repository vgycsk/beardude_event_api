'use strict';

module.exports.policies = {
    EventController: {
        create: 'isActiveManager',
//        getGeneralInfo: '',
        addManagers: 'isActiveManager',
        removeManagers: 'isActiveManager',
        update: 'isActiveManager',
        updateSwitch: 'isActiveManager',
        assignTesterRfid: 'isActiveManager'
    },
    GroupController: {
        create: 'isActiveManager',
//        getInfo: '',
        getManagementInfo: 'isActiveManager',
        delete: 'isActiveManager',
        update: 'isActiveManager'
    },
    ManagerController: {
        activate: 'isInactive',
        create: 'isActiveManager',
//        getGeneralInfo: '',
        getManagementInfo: 'isManagerSelf',
        login: 'isNotLoggedInManager',
        logout: 'isManager',
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
        addRacer: 'isActiveManager',
        removeRacer: 'isActiveManager',
        assignPacerRfid: 'isActiveManager',
        updateAdvancingRules: 'isActiveManager',
        getParsedRaceResult: 'isActiveManager',
        submitRaceResult: 'isActiveManager'
    },
    RacerController: {
//        racerExist: '',
        activate: 'isInactive',
//        create: '',
//        getGeneralInfo: '',
        getManagementInfo: 'isRacerSelfOrTeamLeaderOrManager',
        login: 'isNotLoggedInRacer',
        logout: 'isRacer',
//        reissuePassword: ''
        update: 'isRacerSelfOrTeamLeaderOrManager',
        updatePassword: 'isRacerSelfOrTeamLeaderOrManager'
    },
    RegistrationController: {
        createReg: 'isActiveManager',
//        signupAndCreate: '',
//        signupAndCreateMultiple: '',
//        create: '',
        getInfo: 'isRacerSelfOrTeamLeaderOrManager',
        assignRfid: 'isActiveManager',
        replaceRfid: 'isActiveManager',
        recycleRfid: 'isActiveManager',
        confirmRegistration: 'isActiveManager',
        admitRacer: 'isActiveManager',
        updateDisqualification: 'isActiveManager',
        updateRaceNote: 'isActiveManager'
    },
    TeamController: {
//        teamExist: '',
//        create: '',
//        getInfo: '',
        update: 'isRacerSelfOrTeamLeaderOrManager'
    }
};
