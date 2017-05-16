'use strict';

module.exports.routes = {

    // Event
    // 1.1
    'post /event/create': 'EventController.create',
    // 3.1
    'get  /event/info/:id': 'EventController.getGeneralInfo',
    // 1.3
    'post /event/managers/add': 'EventController.addManagers',
    // 1.3
    'post /event/managers/remove': 'EventController.removeManagers',
    // 1.2.7
    'post /event/update': 'EventController.update',
    // 1.2.10
    'post /event/updateIsPublic': 'EventController.updateIsPublic',

    // Group
    // 1.2.1
    'post /group/create': 'GroupController.create',
    // 3.2, 3.3, 3.4, 5.2.*
    'get  /group/info/:id': 'GroupController.getInfo',
    // 1.2.2
    'post /group/update': 'GroupController.update',
    // 1.2.4
    'post /group/regOpen': 'GroupController.updateIsRegistrationOpen',
    // 1.2.11
    'post /group/isPublic': 'GroupController.updateIsPublic',
    // 1.2.3
    'post /group/delete': 'GroupController.delete',


    // Manager 1.5
    'post /manager/activate': 'ManagerController.activate',
    'post /manager/create': 'ManagerController.create',
    'get  /manager/info/:id': 'ManagerController.getGeneralInfo',
    'get  /manager/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    'post /manager/login': 'ManagerController.login',
    'post /manager/logout': 'ManagerController.logout',
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
    'get  /race/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    // 1.2.8
    'post /race/update': 'RaceController.update',
    // 1.2.6
    'post /race/delete': 'RaceController.delete',
    // 1.4.5, 6.2.4
    'post /race/racers/add': 'RaceController.addRacers',
    // 1.4.6
    'post /race/racers/remove': 'RaceController.removeRacers',
    //6.2.6
    'post /race/assignPacerRfid': 'RaceController.assignPacerRfid',
    // 4.2.3
    'post /race/assignTesterRfid': 'RaceController.assignTesterRfid',

    'post /race/updateAdvancingRules': 'RaceController.updateAdvancingRules',
//   (More race logics)


    // Racer 2.4
    'post /racer/activate': 'RacerController.activate',
    'post /racer/create': 'RacerController.create',
    'get  /racer/info/:id': 'RacerController.getGeneralInfo',
    'get  /racer/mgmtInfo/:id': 'RacerController.getManagementInfo',
    'post /racer/login': 'RacerController.login',
    'post /racer/logout': 'RacerController.logout',
    'get  /racer/reissuePassword/:id': 'RacerController.reissuePassword',
    'post /racer/update': 'RacerController.update',
    'post /racer/updatePassword': 'RacerController.updatePassword',
    // Reset password

    // Registration
    // 2.2.1
    'post /reg/create': 'Registration.create',
    // 5.1.1, 5.1.2
    'get  /reg/info/': 'Registration.getInfo',
    // 4.1.1
    'post /reg/assignRfid': 'Registration.assignRfid',
    // 4.1.2
    'post /reg/replaceRfid': 'Registration.replaceRfid',
    // 8.2
    'post /reg/recycleRfid': 'Registration.recycleRfid',
    // 1.4.3
    'post /reg/updatePayment': 'Registration.updatePayment',
    // 2.2.3
    'post /reg/requestRefund': 'Registration.requestRefund',
    // 1.4.4
    'post /reg/refunded': 'Registration.refunded',
    // 2.2.4
    'post /reg/confirm': 'Registration.confirmRegistration',
    // 6.2.3, 6.2.4
    'post /reg/admitRacer': 'Registration.admitRacer',

    // Team
    // 2.3.3
    'post /team/create': 'TeamController.create',
    // NA
    'get  /team/getInfo': 'TeamController.getInfo',
    // 2.3.4
    'post /team/delete': 'TeamController.delete',
    // 2.3.2
    'post /team/update': 'TeamController.update',
    // 2.3.5
    'post /team/apply': 'TeamController.applyForTeam',
    // 2.3.6
    'post /team/unapply': 'TeamController.unapplyForTeam',
    // 2.3.7
    'post /team/approveRacer': 'TeamController.approveRacer',
    // 2.3.8
    'post /team/removeRacer': 'TeamController.removeRacer',

    // Test page
    'get  /group/update/:id': 'PageController.groupUpdatePage',
    'get  /manager/update/:id': 'PageController.managerUpdatePage',
    'get  /': 'PageController.apiTestPage'
};
