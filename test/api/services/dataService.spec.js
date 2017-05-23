/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Registration */

var dataService = require('../../../api/services/dataService.js');
var assert = require('assert');
var bcrypt = require('bcrypt-nodejs');
var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var sailsMock = require('sails-mock-models');
var randomstring = require('randomstring');

chai.use(chaiAsPromised);
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
        it('should return false if passwords do not match', function (done) {
            var password = '123abcde';
            var enteredPassword = '123Abcde';

            return bcrypt.hash(password, null, null, function (err, hash) {
                if (err) {
                    assert.equal(true, false);
                    return done();
                }
                return dataService.authenticate(enteredPassword, hash)
                .then(function (result) {
                    assert.equal(result, false);
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
        it('should return an object for model update without originalData', function (done) {
            var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isPublic'];
            var input = {
                name: 'newName',
                nameCht: '不變',
                lapDistance: 10,
                location: 'new location',
                isPublic: false
            };
            var originalData = {
                name: 'newName',
                nameCht: '不變',
                lapDistance: 10,
                location: 'new location',
                isPublic: false
            };
            var actual = dataService.returnUpdateObj(fields, input, originalData);

            assert.deepEqual(actual, false);
            done();
        });
        it('should return false if nothing to update', function (done) {
            var fields = ['name', 'nameCht', 'startTime', 'endTime', 'lapDistance', 'location', 'isPublic'];
            var input = {
                name: 'newName',
                nameCht: '不變',
                lapDistance: 10,
                location: 'new location',
                isPublic: false
            };
            var actual = dataService.returnUpdateObj(fields, input);

            assert.deepEqual(actual, input);
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
                var expected = 'my-name';
                var actual = dataService.sluggify(input);

                assert.equal(actual, expected);
                done();
            });
            it('should keep hyphen and convert to lowercase', function (done) {
                var input = 'my-Name';
                var expected = 'my-name';
                var actual = dataService.sluggify(input);

                assert.equal(actual, expected);
                done();
            });
        });
    });
    describe('.validateAdvRules', function () {
        var good1 = require('../../mockdata/advancingRules-good1.json');
        var good2 = require('../../mockdata/advancingRules-good2.json');
        var bad1 = require('../../mockdata/advancingRules-bad1.json');
        var bad2 = require('../../mockdata/advancingRules-bad2.json');
        var bad3 = require('../../mockdata/advancingRules-bad3.json');
        var bad4 = require('../../mockdata/advancingRules-bad4.json');
        var bad5 = require('../../mockdata/advancingRules-bad5.json');

        describe('.continuity()', function () {
            it('should return true when rules are valid', function (done) {
                var actual = dataService.validateAdvRules.continuity(good1);

                assert.equal(actual, true);
                done();
            });
            it('should return false when rankings are not consecutive', function (done) {
                var actual = dataService.validateAdvRules.continuity(bad1);

                assert.equal(actual, false);
                done();
            });
            it('should return false when rankings are not consecutive', function (done) {
                var actual = dataService.validateAdvRules.continuity(bad2);

                assert.equal(actual, false);
                done();
            });
        });

        describe('.startFromZero()', function () {
            it('should return true when ranking start from 0', function (done) {
                var actual = dataService.validateAdvRules.startFromZero(good1);

                assert.equal(actual, true);
                done();
            });
            it('should return false when ranking not start from 0', function (done) {
                var actual = dataService.validateAdvRules.startFromZero(bad3);

                assert.equal(actual, false);
                done();
            });
        });

        describe('.maxRanking()', function () {
            it('should return true when rankings in advancing rules not exceed total racer number', function (done) {
                var totalRacerNumber = 60;
                var actual = dataService.validateAdvRules.maxRanking(good1, totalRacerNumber);

                assert.equal(actual, true);
                done();
            });
            it('should return false when rankings in advancing rules exceed total racer number', function (done) {
                var totalRacerNumber = 60;
                var actual = dataService.validateAdvRules.maxRanking(bad4, totalRacerNumber);

                assert.equal(actual, false);
                done();
            });
        });

        describe('.noOverlap()', function () {
            it('should return true when rankings do not overlap', function (done) {
                var actual = dataService.validateAdvRules.noOverlap(good2);

                assert.equal(actual, true);
                done();
            });
            it('should return false when toRace not the same', function (done) {
                var actual = dataService.validateAdvRules.noOverlap(bad4);

                assert.equal(actual, false);
                done();
            });
            it('should return false when rankings overlap', function (done) {
                var actual = dataService.validateAdvRules.noOverlap(bad5);

                assert.equal(actual, false);
                done();
            });
        });

    });

    describe('.returnUpdatedRaceNotes()', function () {
        it('should append new race note to existing raceNotes array', function (done) {
            var raceId = 7;
            var raceNote = '摔車';
            var existingRaceNotes = [
                {
                    race: 2,
                    note: '疑似晶片脫落'
                }
            ];
            var actual = dataService.returnUpdatedRaceNotes(raceId, raceNote, existingRaceNotes);
            var expected = [
                {
                    race: 2,
                    note: '疑似晶片脫落'
                },
                {
                    race: 7,
                    note: '摔車'
                }
            ];

            assert.deepEqual(actual, expected);
            done();
        });

        it('should replace existing race note', function (done) {
            var raceId = 2;
            var raceNote = '疑似摔車造成晶片脫落';
            var existingRaceNotes = [
                {
                    race: 2,
                    note: '疑似晶片脫落'
                }
            ];
            var actual = dataService.returnUpdatedRaceNotes(raceId, raceNote, existingRaceNotes);
            var expected = [
                {
                    race: 2,
                    note: '疑似摔車造成晶片脫落'
                }
            ];

            assert.deepEqual(actual, expected);
            done();
        });
    });

    describe('.returnParsedRaceResult()', function () {
        var recordsHashTable1 = require('../../mockdata/recordsHashTable1.json');
        var registrations1 = require('../../mockdata/registrations1.json');

        it('should return parsed race result', function (done) {
            var actual = dataService.returnParsedRaceResult(recordsHashTable1, 9, registrations1);
            var expected = {
                disqualified: [
                    {
                        epc: 'e2801160600002066604d485',
                        data: [
                            '1494477554987403',
                            '1494477754957403',
                            '1494477951977403',
                            '1494478154977405',
                            '1494478353977403',
                            '1494478551977403',
                            '1494478752977403'
                        ]
                    }
                ],
                dnf: [{
                    epc: 'e2801160600002066604d487',
                    data: [
                        '1494477554987403',
                        '1494477754957403',
                        '1494477951977403',
                        'dnf'
                    ]
                }],
                finished: [
                    {
                        epc: 'e2801160600002066604d481',
                        data: [
                            '1494477554977403',
                            '1494477754977403',
                            '1494477954977403',
                            '1494478154977403',
                            '1494478354977403',
                            '1494478554977403',
                            '1494478754977403',
                            '1494478954977403',
                            '1494479154977403',
                            '1494479344977403'
                        ]
                    },
                    {
                        epc: 'e2801160600002066604d480',
                        data: [
                            '1494477554987403',
                            '1494477754957403',
                            '1494477951977403',
                            '1494478154977405',
                            '1494478353977403',
                            '1494478551977403',
                            '1494478752977403',
                            '1494478934977403',
                            '1494479114977403',
                            '1494479324977403'
                        ]
                    }
                ],
                finishedWithoutTime: [{
                    epc: 'e2801160600002066604d489',
                    data: [
                        '1494477554987403',
                        '1494477754957403',
                        '1494477951977403'
                    ]
                }]
            };

            assert.deepEqual(actual, expected);
            done();
        });
    });

    describe('.returnAccessCode()', function () {
        it('should return 4-letter unique access code within an event', function (done) {
            var expected = 'abcd';
            var actual;

            sailsMock.mockModel(Registration, 'findOne');
            actual = dataService.returnAccessCode(1);
            sandbox.stub(randomstring, 'generate').callsFake(function () {
                return 'abcd';
            });

            expect(actual).to.eventually.equal(expected);
            Registration.findOne.restore();
            done();
        });
    });
});
