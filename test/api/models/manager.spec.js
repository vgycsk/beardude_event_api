/* global describe, it */

var managerModel = require('../../../api/models/Manager.js');
var assert = require('assert');

describe('/models/manager', function() {
    it('.beforeCreate should encrypt pasword', function (done) {
        var mockData = {
            firstName: 'John',
            lastName: 'Doe',
            phone: '0900-000-000',
            email: 'info@beardude.com',
            password: '123abcde'
        };
        var password = '123abcde';

        managerModel.beforeCreate(mockData, function () {
            assert.notEqual(mockData.password, password);
            done();
        });
    });

});
