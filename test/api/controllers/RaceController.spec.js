/* eslint-disable no-magic-numbers */
/* global describe, it, Race */

var raceController = require('../../../api/controllers/RaceController.js');
var sailsMock = require('sails-mock-models');
var chai = require('chai');
var expect = chai.expect;

describe('/controllers/RaceController', function() {
    describe('.create()', function () {
        it('should create a race', function (done) {
            var actual;
            // {group: ID, name: STR, laps: INT, racerNumberAllowed: INT, isCheckinOpen: BOOL, requirePacer: BOOL}
            var req = {
                body: {
                    group: 5,
                    name: 'new race',
                    racerNumberAllowed: 60,
                    requirePacer: true
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var mockData = {
                id: 8,
                group: 5,
                name: 'new race',
                racerNumberAllowed: 60,
                requirePacer: true
            };
            var expected = {
                message: 'Race created',
                race: mockData
            };

            sailsMock.mockModel(Race, 'create', mockData);
            this.timeout(50);
            raceController.create(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.create.restore();
                done();
            }, 30);
        });
    });
    describe('.delete()', function () {
        it('return error when trying to delete a started race', function (done) {
            var actual;
            var req = {
                body: {
                    race: 5
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                id: 8,
                group: 5,
                name: 'new race',
                startTime: '2017-10-10T08:00:00-08:00'
            };
            var expected = new Error('Cannot delete a started race');

            sailsMock.mockModel(Race, 'findOne', mock);
            this.timeout(50);
            raceController.delete(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                done();
            }, 30);
        });
        it('should delete a race', function (done) {
            var actual;
            var req = {
                body: {
                    race: 5
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                id: 8,
                group: 5,
                name: 'new race'
            };
            var expected = {
                message: 'Race deleted',
                race: 5
            };

            sailsMock.mockModel(Race, 'findOne', mock);
            sailsMock.mockModel(Race, 'destroy');

            this.timeout(50);
            raceController.delete(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                Race.destroy.restore();
                done();
            }, 30);
        });
    });
    describe('.getGeneralInfo()', function () {
        it('should return filtered race info', function (done) {
            var actual;
            var req = {
                params: {
                    id: '5'
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                id: 5,
                registrations: [1, 2, 3],
                group: 1,
                name: 'A race',
                laps: 22,
                racerNumberAllowed: 60,
                advancingRules: [],
                isCheckinOpen: true,
                requirePacer: true,
                startTime: '',
                endTime: '',
                recordsHashTable: {},
                result: []
            };
            var expected = {
                registrations: [1, 2, 3],
                group: 1,
                name: 'A race',
                laps: 22,
                racerNumberAllowed: 60,
                advancingRules: [],
                isCheckinOpen: true,
                requirePacer: true,
                startTime: '',
                endTime: '',
                recordsHashTable: {},
                result: []
            };

            sailsMock.mockModel(Race, 'findOne', mock);
            this.timeout(50);
            raceController.getGeneralInfo(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                done();
            }, 30);
        });
    });
    describe('.getManagementInfo()', function () {
        it('should return complete race info', function (done) {
            var actual;
            var req = {
                params: {
                    id: '5'
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                id: 5,
                registrations: [1, 2, 3],
                group: 1,
                name: 'A race',
                laps: 22,
                racerNumberAllowed: 60,
                advancingRules: [],
                isCheckinOpen: true,
                requirePacer: true,
                startTime: '',
                endTime: '',
                recordsHashTable: {},
                result: []
            };
            var expected = {
                id: 5,
                registrations: [1, 2, 3],
                group: 1,
                name: 'A race',
                laps: 22,
                racerNumberAllowed: 60,
                advancingRules: [],
                isCheckinOpen: true,
                requirePacer: true,
                startTime: '',
                endTime: '',
                recordsHashTable: {},
                result: []
            };

            sailsMock.mockModel(Race, 'findOne', mock);
            this.timeout(50);
            raceController.getManagementInfo(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                done();
            }, 30);
        });
    });
    /*
    describe('.update()', function () {
        it('should update race', function (done) {
        });
    });
    describe('.addRacers()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should add valid racer to race', function (done) {
        });
    });
    describe('.removeRacers()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should remove valid racer to race', function (done) {
        });
    });
    describe('.assignPacerRfid()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should remove valid racer to race', function (done) {
        });
    });
    describe('.updateAdvancingRules()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should remove valid racer to race', function (done) {
        });
    });
    describe('.getParsedRaceResult()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should remove valid racer to race', function (done) {
        });
    });
    describe('.advancingRacerToRace()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should remove valid racer to race', function (done) {
        });
    });
    describe('.submitRaceResult()', function () {
        it('should return error if racer not in group', function (done) {
        });
        it('should remove valid racer to race', function (done) {
        });
    });
    */
});
