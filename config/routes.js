'use strict';

module.exports.routes = {
    // Event
    'post /api/event/create': 'EventController.create',
    'get  /api/event/info/:uniqueName': 'EventController.getInfo',
    'get  /api/event/getEvents': 'EventController.getEvents',
    'post /api/event/update': 'EventController.update',
    'get  /api/event/delete/:id': 'EventController.delete',

    // Group
    'post /api/group/create': 'GroupController.create',
    'post /api/group/update': 'GroupController.update',
    'get  /api/group/delete/:id': 'GroupController.delete',

    // Manager 1.5
    'post /api/manager/login': 'ManagerController.login',
    'get  /api/manager/logout': 'ManagerController.logout',
    'get  /api/manager/account': 'ManagerController.getAccountInfo',
    'post /api/manager/create': 'ManagerController.create',
    'get  /api/manager/info/:id': 'ManagerController.getGeneralInfo',
    'get  /api/manager/getManagers': 'ManagerController.getManagers',
    'get  /api/manager/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    'post /api/manager/update': 'ManagerController.update',
    'post /api/manager/updatePassword': 'ManagerController.updatePassword',

    // Race
    'post /api/race/create': 'RaceController.create',
    'post /api/race/update': 'RaceController.update',
    'get  /api/race/delete/:id': 'RaceController.delete',
    'post /api/race/assignRegsToRaces': 'RaceController.assignRegsToRaces',
    'post /api/race/start': 'RaceController.startRace',
    'post /api/race/reset': 'RaceController.resetRace',
    'post /api/race/end': 'RaceController.endRace',
    'post /api/race/submitResult': 'RaceController.submitResult',

    // Socket.io
    'get  /api/socket/info': 'RaceController.socket',
    '/api/socket/mgmt': 'RaceController.socketManagement',
    '/api/socket/impinj': 'RaceController.socketImpinj',

    // Racer 2.4
    'post /api/racer/activate': 'RacerController.activate',
    'post /api/racer/create': 'RacerController.create',
    'get  /api/racer/info/:id': 'RacerController.getGeneralInfo',
    'get  /api/racer/getRacers': 'RacerController.getRacers',
    'get  /api/racer/mgmtInfo/:id': 'RacerController.getManagementInfo',
    'post /api/racer/login': 'RacerController.login',
    'post /api/racer/logout': 'RacerController.logout',
    'get  /api/racer/reissuePassword/:id': 'RacerController.reissuePassword',
    'post /api/racer/update': 'RacerController.update',
    'post /api/racer/updatePassword': 'RacerController.updatePassword',
    // Reset password

    // Registration
    'post /api/reg/create': 'RegistrationController.create',
    'post /api/reg/update': 'RegistrationController.update',
    'get  /api/reg/delete/:id': 'RegistrationController.delete',
//    'post /api/reg/updateRaceNote': 'RegistrationController.updateRaceNote',
//    'post  /api/regs': 'RegistrationController.getRegs',
//    'post /api/reg/signupAndCreate': 'RegistrationController.signupAndCreate',
//    'post /api/reg/signupAndCreateTeam': 'RegistrationController.signupAndCreateTeam',
    //'post /api/reg/updatePayment': 'RegistrationController.updatePayment',
    //'post /api/reg/requestRefund': 'RegistrationController.requestRefund',
    //'post /api/reg/refunded': 'RegistrationController.refunded',
//    'post /api/reg/confirm': 'RegistrationController.confirmRegistration',
//    'post /api/reg/admitRacer': 'RegistrationController.admitRacer',

    // Team
    'post /api/team/nameAvailable': 'TeamController.nameAvailable',
    'post /api/team/create': 'TeamController.create',
    'get  /api/team/getInfo/:id': 'TeamController.getInfo',
    'get  /api/team/getTeams': 'TeamController.getTeams',
    'post /api/team/update': 'TeamController.update',
    //'post /api/team/delete': 'TeamController.delete',
    //'post /api/team/invite': 'TeamController.invite',
    //'post /api/team/acceptInvitation': 'TeamController.acceptInvitation',

    // Test page
    'get  /test/socket': { view: 'socket' }

};
