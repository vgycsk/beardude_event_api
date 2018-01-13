'use strict';

module.exports.policies = {
    EventController: {
      create: 'isManager',
//    getInfo: '',
//    getEvents: '',
      update: 'isManager',
      delete: 'isManager'
    },
    GroupController: {
      create: 'isManager',
      delete: 'isManager',
      update: 'isManager'
    },
    ManagerController: {
      create: 'isManager',
//      getGeneralInfo: '',
      getManagers: 'isManager',
      getManagementInfo: 'isManager',
      login: 'isNotLoggedIn',
//      logout: '',
      update: 'isManager',
      updatePassword: 'isManager',
//      resetPassword: ''
    },
    RaceController: {
      create: 'isManager',
      update: 'isManager',
      updateMulti: 'isManager',
      delete: 'isManager',
      testRfid: 'isManager',
      startRace: 'isManager',
      resetRace: 'isManager',
      endRace: 'isManager',
      socketManagement: 'isManager'
//      socketPublic: '',
//      socketImpinj: ''
//      socketImpinjReceiver
    },
    RegistrationController: {
//      create: '',
      update: 'isManager',
      delete: 'isManager',
//      signupAndCreateTeam: ''
    },
    TeamController: {
//    create: '',
//    getInfo: '',
//    getTeams: '',
      update: ['isManager', 'isTeamLeader']
    }
};
