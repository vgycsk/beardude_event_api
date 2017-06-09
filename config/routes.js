'use strict';

module.exports.routes = {

    // Event
    // 1.1 -
    'post /event/create': 'EventController.create',
    // 3.1 -
    'get  /event/info/:id': 'EventController.getGeneralInfo',
    // 1.3
    'post /event/managers/add': 'EventController.addManagers',
    // 1.3
    'post /event/managers/remove': 'EventController.removeManagers',
    // 1.2.7 -
    'post /event/update': 'EventController.update',
    // 1.2.10 -
    'post /event/updateSwitch': 'EventController.updateSwitch',
    // 4.2.3
    'post /event/assignTesterRfid': 'EventController.assignTesterRfid',
    // 1.6
    'get  /event/delete/:id': 'EventController.delete',

    // Group
    // 1.2.1
    'post /group/create': 'GroupController.create',
    // 3.2, 3.3, 3.4, 5.2.*
    'get  /group/info/:id': 'GroupController.getInfo',
    // 1.2.2
    'post /group/update': 'GroupController.update',
    // 1.2.3
    'get  /group/delete/:id': 'GroupController.delete',

    // Manager 1.5
    'post /manager/login': 'ManagerController.login',
    'get  /manager/logout': 'ManagerController.logout',
    'get  /manager/account': 'ManagerController.getAccountInfo',
    'post /manager/activate': 'ManagerController.activate',
    'post /manager/create': 'ManagerController.create',
    'get  /manager/info/:id': 'ManagerController.getGeneralInfo',
    'get  /manager/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    'get  /manager/reissuePassword/:id': 'ManagerController.reissuePassword',
    'post /manager/update': 'ManagerController.update',
    'post /manager/updatePassword': 'ManagerController.updatePassword',
    // Reset password

    // Race
    //1.2.5
    'post /race/create': 'RaceController.create',
    // 7.1.1, 7.1.3
    'get  /race/info/:id': 'RaceController.getGeneralInfo',
    // 6.1.2, 6.2.7, 6.2.8, 6.3.1, 6.3.2, 6.3.3, 6.3.4
    'get  /race/mgmtInfo/:id': 'RaceController.getManagementInfo',
    // 1.2.8
    'post /race/update': 'RaceController.update',
    // 1.2.6
    'post /race/delete': 'RaceController.delete',
    // 1.4.5, 6.2.4
    'post /race/racer/add': 'RaceController.addRacer',
    // 1.4.6
    'post /race/racer/remove': 'RaceController.removeRacer',
    //6.2.6
    'post /race/assignPacerRfid': 'RaceController.assignPacerRfid',
    // 1.2.9
    'post /race/updateAdvancingRules': 'RaceController.updateAdvancingRules',
    // 6.3.7
    'get  /race/getParsedRaceResult/:id': 'RaceController.getParsedRaceResult',
    // 6.3.10
    'post /race/submitRaceResult': 'RaceController.submitRaceResult',
    // 1.7.1
    'post /race/assignRacersToRace': 'RaceController.assignRacersToRace',
    // 1.7.2
    'post /race/reassignRacerToRace': 'RaceController.reassignRacer',
    // 4.2.4, 4.2.5, 4.2.6
    'get /race/joinReaderRoom': 'RaceController.joinReaderRoom',
    'post /race/readerRoom': 'RaceController.readerReceiver',
//   (More race logics)


    // Racer 2.4
    'post /racer/activate': 'RacerController.activate',
    // Create while registering for an event
    //'post /racer/create': 'RacerController.create',
    'get  /racer/info/:id': 'RacerController.getGeneralInfo',
    'get  /racer/mgmtInfo/:id': 'RacerController.getManagementInfo',
    'post /racer/login': 'RacerController.login',
    'post /racer/logout': 'RacerController.logout',
    'get  /racer/reissuePassword/:id': 'RacerController.reissuePassword',
    'post /racer/update': 'RacerController.update',
    'post /racer/updatePassword': 'RacerController.updatePassword',
    // 2.2.2
    'post /racer/exist': 'RacerController.racerExist',
    // Reset password

    // Registration - prerace
    // 2.2.5
    'post /reg/signupAndCreate': 'RegistrationController.signupAndCreate',
    // 2.2.2
    'post /reg/signupAndCreateMultiple': 'RegistrationController.signupAndCreateMultiple',
    // 2.2.1
    'post /reg/create': 'RegistrationController.create',
    // 1.4.3
    //'post /reg/updatePayment': 'RegistrationController.updatePayment',
    // 2.2.3
    //'post /reg/requestRefund': 'RegistrationController.requestRefund',
    // 1.4.4
    //'post /reg/refunded': 'RegistrationController.refunded',
    // 2.2.4
    'post /reg/confirm': 'RegistrationController.confirmRegistration',
    // 5.1.1, 5.1.2
    'post /reg/info': 'RegistrationController.getInfo',

    // Registration - race logic
    // 4.1.1
    'post /reg/assignRfid': 'RegistrationController.assignRfid',
    // 4.1.2
    'post /reg/replaceRfid': 'RegistrationController.replaceRfid',
    // 8.2
    'post /reg/recycleRfid': 'RegistrationController.recycleRfid',
    // 6.2.3, 6.2.4
    'post /reg/admitRacer': 'RegistrationController.admitRacer',
    // 6.3.9
    'post /reg/updateRaceNote': 'RegistrationController.updateRaceNote',
    // 6.3.6
    'post /reg/updateDisqualification': 'RegistrationController.updateDisqualification',

    // Team
    // 之後再開放進階隊伍管理功能
    // 2.2.2
    'post /team/exist': 'TeamController.teamExist',
    // 2.3.3
    //'post /team/create': 'TeamController.create',
    // NA
    'get  /team/getInfo/:id': 'TeamController.getInfo',
    // 2.3.4
    //'post /team/delete': 'TeamController.delete',
    // 2.3.2
    'post /team/update': 'TeamController.update',

    // 2.3.5
    //'post /team/apply': 'TeamController.applyForTeam',
    // 2.3.6
    //'post /team/unapply': 'TeamController.unapplyForTeam',
    // 2.3.7
    //'post /team/approveRacer': 'TeamController.approveRacer',
    // 2.3.8
    //'post /team/removeRacer': 'TeamController.removeRacer',

    // Test page
    'get  /race/update/:id': 'TestPageController.raceUpdatePage',
    'get  /team/update/:id': 'TestPageController.teamUpdatePage',
    'get  /group/update/:id': 'TestPageController.groupUpdatePage',
    'get  /event/update/:id': 'TestPageController.eventUpdatePage',
    'get  /manager/update/:id': 'TestPageController.managerUpdatePage',
    'get  /': 'TestPageController.apiTestPage',
    '/testSocket': {
      view: 'testSocketPage'
    },
    '/console/*': {
      view: 'sharePage'
    },
    '/console': {
      view: 'sharePage'
    }
};
