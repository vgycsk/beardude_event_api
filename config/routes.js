'use strict';

module.exports.routes = {

    // Event
    'post /event/create': 'EventController.create',

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

    // Test page
    'get  /manager/update/:id': 'PageController.managerUpdatePage',
    'get  /': 'PageController.apiTestPage'
};
