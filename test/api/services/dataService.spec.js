/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it */

var dataService = require('../../../api/services/dataService.js');
var assert = require('assert');
var bcrypt = require('bcrypt-nodejs');
var sinon = require('sinon');

describe('services/dataService', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('authenticate()', function () {
        it('should return true if password matches', function (done) {
            var password = '123abcde';

            return bcrypt.hash(password, null, null, function (err, hash) {
                if (err) {
                    assert.equal(false, true);
                    return done();
                }
                return dataService.authenticate(password, hash)
                .then(function (result) {
                    assert.equal(result, true);
                    return done();
                });
            });
        });
    });
    describe('.returnUpdateObj()', function () {
        it('should return an object for model update', function (done) {
            var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isPublic'];
            var input = {
                name: 'newName',
                nameCht: '不變',
                lapDistance: 10,
                location: 'new location',
                isPublic: false
            };
            var originalData = {
                name: 'Name',
                nameCht: '不變',
                lapDistance: 22,
                location: 'location',
                isPublic: false
            };
            var actual = dataService.returnUpdateObj(fields, input, originalData);
            var expected = {
                name: 'newName',
                lapDistance: 10,
                location: 'new location'
            };

            assert.deepEqual(actual, expected);
            done();
        });
    });
});
