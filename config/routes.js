'use strict';

module.exports.routes = {

    // Event (To do: policy)
    'post /event/create': 'EventController.create',
    'get  /event/info/:id': 'EventController.getInfo',
    'post  /event/managers/add': 'EventController.addManagers',
    'post  /event/managers/remove': 'EventController.removeManagers',
    'post  /event/racers/add': 'EventController.addRacers',
    'post  /event/racers/remove': 'EventController.removeRacers',
    'post  /event/update': 'EventController.update',
    // Manager
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

    // Racer
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

    // Race
    //'post /race/create': 'RaceController.create',
    //'get  /race/info/:id': 'RaceController.getInfo',
    //'post /race/update': 'RaceController.update',
    //'get  /race/delete/:id': 'RaceController.delete',

    // Test page
    'get  /manager/update/:id': 'PageController.managerUpdatePage',
    'get  /': 'PageController.apiTestPage'
};
