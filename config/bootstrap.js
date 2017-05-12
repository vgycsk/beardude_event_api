'use strict';

// Execute on app start 
var randomstring = require('randomstring');
var Q = require('q');

module.exports.bootstrap = function(cb) {
    var initManagerEmail = 'info@beardude.com';
    var tempPassword = randomstring.generate();
    var createInitManager = function (email, password) {
        var q = Q.defer();
        var managerObj = {
            email: email,
            phone: '0905252302',
            firstName: 'Azai',
            lastName: 'Chan',
            password: password,
            isActive: false
        };

        Address.create({})
        .then(function (addressData) {
            managerObj.address = addressData.id;
            return Manager.create(managerObj);
        })
        .then(function (managerData) {
            return q.resolve(managerData);
        });
        return q.promise;
    };

    // Initiate first manager only when there's no manager
    Manager.find({})
    .then(function (managerData) {
        if (managerData.length === 0) {
            return createInitManager(initManagerEmail, tempPassword);
        } else if (managerData.length === 1 && managerData[0].email === initManagerEmail && !managerData[0].isActive) {
            // New account and not logged in yet. Reset password
            return Manager.update({
                email: initManagerEmail
            }, {
                password: tempPassword
            });
        }
        return false;
    })
    .then(function (managerData) {
        if (managerData) {
            console.log('Please use this credential to login, and change your password afterward:');
            console.log('account name: ', initManagerEmail);
            console.log('password: ', tempPassword);
        }
        return cb();
    });
};
