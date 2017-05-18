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
    describe('.sluggify()', function () {
        it('should return sluggified string', function () {
            it('should convert to lowercase', function (done) {
                var input = 'Myname';
                var expected = 'myname';
                var actual = dataService.sluggify(input);

                assert.equal(actual, expected);
                done();
            });
            it('should remove space in name', function (done) {
                var input = 'my name';
                var expected = 'myname';
                var actual = dataService.sluggify(input);

                assert.equal(actual, expected);
                done();
            });
        });
    });
    describe('.validateAdvRules', function () {
        var rule1 = require('../../mockdata/advancingRules-good1.json');
        var rule2 = require('../../mockdata/advancingRules-bad1.json');

        describe('.continuity()', function () {
            it('should return true when rules are valid', function (done) {
                var actual = dataService.validateAdvRules.continuity(rule1);
                assert.equal(actual, true);
                done();
            });
            it('should return false when rankings are not consecutive', function (done) {
                var actual = dataService.validateAdvRules.continuity(rule2);
                assert.equal(actual, false);
                done();
            });
        });
        /*
        describe('.startFromZero()', function () {
            it('should ', function () {
            });
        });
        describe('.maxRanking()', function () {
            it('should ', function () {
            });
        });
        describe('.noOverlap()', function () {
            it('should ', function () {
            });
        });
        */
    });
    /*
    describe('.returnUpdatedRaceNotes()', function () {
        it('should ', function () {
        });
    });
    describe('.returnParsedRaceResult()', function () {
        it('should ', function () {
        });
    });
    */
});
