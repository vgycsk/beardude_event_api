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
    'post /api/manager/create': 'ManagerController.create',
    'get  /api/manager/info/:id': 'ManagerController.getGeneralInfo',
    'get  /api/manager/getManagers': 'ManagerController.getManagers',
    'get  /api/manager/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    'post /api/manager/update': 'ManagerController.update',
    'post /api/manager/updatePassword': 'ManagerController.updatePassword',
    'get /api/manager/resetPassword/:email': 'ManagerController.resetPassword',

    // Race
    'post /api/race/create': 'RaceController.create',
    'post /api/race/update': 'RaceController.update',
    'post /api/race/updateMulti': 'RaceController.updateMulti',
    'get  /api/race/delete/:id': 'RaceController.delete',
    'post /api/race/start': 'RaceController.startRace',
    'post /api/race/reset': 'RaceController.resetRace',
    'post /api/race/end': 'RaceController.endRace',
    'post /api/race/testRfid': 'RaceController.testRfid',

    // Socket.io
    'get  /api/socket/info': 'RaceController.socketPublic',
    'get  /api/socket/mgmt': 'RaceController.socketManagement',
    'get  /api/socket/impinj': 'RaceController.socketImpinj',
    'post /api/socket/impinj': 'RaceController.socketImpinjReceiver',

    // Registration
    'post /api/reg/create': 'RegistrationController.create',
    'post /api/reg/update': 'RegistrationController.update',
    'get  /api/reg/delete/:id': 'RegistrationController.delete',
    'post /api/reg/signupAndCreateTeam': 'RegistrationController.signupAndCreateTeam',
    //'post /api/reg/updatePayment': 'RegistrationController.updatePayment',

    // Team
    'post /api/team/create': 'TeamController.create',
    'get  /api/team/getTeams': 'TeamController.getTeams',
    'post /api/team/update': 'TeamController.update',
    //'post /api/team/delete': 'TeamController.delete'

    // Test page
    'get  /test/socket': { view: 'socket' }

};
