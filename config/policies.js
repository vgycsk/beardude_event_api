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
        assignTesterRfid: 'isActiveManager',
        delete: 'isActiveManager'
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
        getRacers: 'isActiveManager',
        getManagementInfo: 'isRacerSelfOrTeamLeaderOrManager',
        login: 'isNotLoggedInRacer',
//        logout: '',
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
        update: 'isTeamLeaderOrManager'
    }
};
