'use strict';

module.exports.routes = {

    // Event
    // 1.1 -
    'post /api/event/create': 'EventController.create',
    // 3.1 -
    'get  /api/event/info/:id': 'EventController.getGeneralInfo',
    'get  /api/event/mgmtInfo/:id': 'EventController.getManagementInfo',
    // 3.1
    'get  /api/event/getEvents': 'EventController.getEvents',
    // 1.2.7, 1.2.8
    'post /api/event/update': 'EventController.update',
    // 1.6
    'get  /api/event/delete/:id': 'EventController.delete',

    // 4.1.1, 4.1.2
    'post /api/event/rfid/reg': 'EventController.rfidReg',
    // 4.2.3
    'post /api/event/rfid/tester': 'EventController.rfidTester',
    // 6.2.6
    'post /api/event/rfid/pacer': 'EventController.rfidPacer',
    // 8.2
    'post /api/event/rfid/recycle': 'EventController.rfidRecycle',

    // 1.3
//    'post /api/event/managers/add': 'EventController.addManagers',
//    'post /api/event/managers/remove': 'EventController.removeManagers',

    // Group
    // 1.2.1
    'post /api/group/create': 'GroupController.create',
    // 3.2, 3.3, 3.4, 5.2.*
    'get  /api/group/info/:id': 'GroupController.getInfo',
    // 1.2.2
    'post /api/group/update': 'GroupController.update',
    // 1.2.3
    'get  /api/group/delete/:id': 'GroupController.delete',

    // Manager 1.5
    'post /api/manager/login': 'ManagerController.login',
    'get  /api/manager/logout': 'ManagerController.logout',
    'get  /api/manager/account': 'ManagerController.getAccountInfo',
    'post /api/manager/activate': 'ManagerController.activate',
    'post /api/manager/create': 'ManagerController.create',
    'get  /api/manager/info/:id': 'ManagerController.getGeneralInfo',
    'get  /api/manager/getManagers': 'ManagerController.getManagers',
    'get  /api/manager/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    'get  /api/manager/reissuePassword/:id': 'ManagerController.reissuePassword',
    'post /api/manager/update': 'ManagerController.update',
    'post /api/manager/updatePassword': 'ManagerController.updatePassword',
    // Reset password

    // Race
    //1.2.5
    'post /api/race/create': 'RaceController.create',
    // 7.1.1, 7.1.3
    'get  /api/race/info/:id': 'RaceController.getGeneralInfo',
    // 6.1.2, 6.2.7, 6.2.8, 6.3.1, 6.3.2, 6.3.3, 6.3.4
    'get  /api/race/mgmtInfo/:id': 'RaceController.getManagementInfo',
    // 1.2.8, 1.2.9
    'post /api/race/update': 'RaceController.update',
    // 1.2.6
    'get  /api/race/delete/:id': 'RaceController.delete',
    // 1.4.5, 1.7.1, 6.2.4, 1.7.2, 1.4.6, 1.7.2
    'post /api/race/reg/:action': 'RaceController.assignRacers',
    // 6.3.7
    'get  /api/race/getParsedRaceResult/:id': 'RaceController.getParsedRaceResult',
    // 6.3.10
    'post /api/race/submitRaceResult': 'RaceController.submitRaceResult',
    // 4.2.4, 4.2.5, 4.2.6
    'get  /api/race/joinReaderRoom': 'RaceController.joinReaderRoom',
    'post /api/race/readerRoom': 'RaceController.readerReceiver',


    // Racer 2.4
    'post /api/racer/activate': 'RacerController.activate',
    // Create while registering for an event
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

    // Registration - prerace
    // 2.2.1
    'post /api/reg/create': 'RegistrationController.create',
    // 5.1.1, 5.1.2
    'post /api/reg/info': 'RegistrationController.getInfo',
    'post /api/reg/update': 'RegistrationController.update',
    'post /api/reg/delete': 'RegistrationController.delete',
    // 2.2.5 正式版再說
//    'post /api/reg/signupAndCreate': 'RegistrationController.signupAndCreate',
    // 2.2.2 正式版再說
//    'post /api/reg/signupAndCreateTeam': 'RegistrationController.signupAndCreateTeam',
    // 1.4.3
    //'post /api/reg/updatePayment': 'RegistrationController.updatePayment',
    // 2.2.3
    //'post /api/reg/requestRefund': 'RegistrationController.requestRefund',
    // 1.4.4
    //'post /api/reg/refunded': 'RegistrationController.refunded',
    // 2.2.4 正式版再說
//    'post /api/reg/confirm': 'RegistrationController.confirmRegistration',


    // Registration - race logic
    // 6.2.3, 6.2.4 正式版再說
//    'post /api/reg/admitRacer': 'RegistrationController.admitRacer',
    // 6.3.9
    'post /api/reg/updateRaceNote': 'RegistrationController.updateRaceNote',
    // 6.3.6
    'post /api/reg/updateDisqualification': 'RegistrationController.updateDisqualification',

    // Team
    // 2.2.2
    'post /api/team/nameAvailable': 'TeamController.nameAvailable',
    // 2.3.3
    'post /api/team/create': 'TeamController.create',
    // 1.4.1
    'get  /api/team/getInfo/:id': 'TeamController.getInfo',
    // 1.4.1
    'get  /api/team/getTeams': 'TeamController.getTeams',
    // 2.3.4
    //'post /api/team/delete': 'TeamController.delete',
    // 2.3.2, 2.3.7, 2.3.8
    'post /api/team/update': 'TeamController.update',
    // 2.3.5
    //'post /api/team/invite': 'TeamController.invite',
    // 2.3.6
    //'post /api/team/acceptInvitation': 'TeamController.acceptInvitation',

    // Test page
    'get  /race/update/:id': 'TestPageController.raceUpdatePage',
    'get  /team/update/:id': 'TestPageController.teamUpdatePage',
    'get  /group/update/:id': 'TestPageController.groupUpdatePage',
    'get  /event/update/:id': 'TestPageController.eventUpdatePage',
    'get  /manager/update/:id': 'TestPageController.managerUpdatePage',
    'get  /': 'TestPageController.apiTestPage',
    '/testSocket': { view: 'testSocketPage' },
    '/console/*': { view: 'sharePage' },
    '/console': { view: 'sharePage' }
};
