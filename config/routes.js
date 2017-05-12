'use strict';

module.exports.routes = {
    // Test page
    'get  /': 'PageController.apiTestPage',
    'get /manager/update/:id': 'PageController.managerUpdatePage',
    // Event
    'post /event/create': 'EventController.create',

    // Manager
    'post /manager/activate': 'ManagerController.activate',
    'post /manager/create': 'ManagerController.create',
    'get /manager/info/:id': 'ManagerController.getGeneralInfo',
    'get /manager/mgmtInfo/:id': 'ManagerController.getManagementInfo',
    'post /manager/login': 'ManagerController.login',
    'post /manager/logout': 'ManagerController.logout',
    'post /manager/update': 'ManagerController.update',

};
