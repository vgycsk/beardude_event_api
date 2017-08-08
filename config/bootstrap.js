'use strict';

module.exports.bootstrap = function(cb) {
    // Initiate first manager account
    Manager.find({})
    .then(function (managerData) {
        if (managerData.length === 0) {
          return Manager.create({
            email: 'azaitw@github.com',
            phone: '12345678',
            firstName: 'Azai',
            lastName: 'Chan',
            password: '123',
            isActive: true
          })
        }
        return false;
    })
    .then(function () { return cb() })
}
