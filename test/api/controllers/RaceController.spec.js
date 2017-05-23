/* eslint-disable no-magic-numbers, max-lines */
/* global describe, Group, it, Race, Registration */

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
    describe('.update()', function () {
        it('should update race', function (done) {
            var actual;
            // {race: ID, name: STR, laps: INT, racerNumberAllowed: INT, isCheckinOpen: BOOL, requirePacer: BOOL}

            var req = {
                body: {
                    race: '5',
                    laps: 28
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
            var mockUpdate = [{
                id: 5,
                registrations: [1, 2, 3],
                group: 1,
                name: 'A race',
                laps: 28,
                racerNumberAllowed: 60,
                advancingRules: [],
                isCheckinOpen: true,
                requirePacer: true,
                startTime: '',
                endTime: '',
                recordsHashTable: {},
                result: []
            }];
            var expected = {
                message: 'Race updated',
                race: {
                    id: 5,
                    registrations: [1, 2, 3],
                    group: 1,
                    name: 'A race',
                    laps: 28,
                    racerNumberAllowed: 60,
                    advancingRules: [],
                    isCheckinOpen: true,
                    requirePacer: true,
                    startTime: '',
                    endTime: '',
                    recordsHashTable: {},
                    result: []
                }
            };

            sailsMock.mockModel(Race, 'findOne', mock);
            sailsMock.mockModel(Race, 'update', mockUpdate);
            this.timeout(99);
            raceController.update(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                Race.update.restore();
                done();
            }, 70);
        });
    });
    describe('.addRacer()', function () {
        it('should return error if racer not in group', function (done) {
            var actual;
            var req = {
                body: {
                    event: '1',
                    race: '5',
                    raceNumber: '10'
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
            var mockReg = {
                id: 10,
                raceNumber: 10
            };
            var mockRace = {
                id: 5,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    }
                ],
                group: 1
            };
            var mockGroup = {
                id: 1,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    }
                ]
            };
            var expected = new Error('Racer not in group');

            sailsMock.mockModel(Registration, 'findOne', mockReg);
            sailsMock.mockModel(Race, 'findOne', mockRace);
            sailsMock.mockModel(Group, 'findOne', mockGroup);
            this.timeout(50);
            raceController.addRacer(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Race.findOne.restore();
                Group.findOne.restore();
                done();
            }, 30);
        });
        it('should return error if racer already in race', function (done) {
            var actual;
            var req = {
                body: {
                    event: '1',
                    race: '5',
                    raceNumber: '10'
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
            var mockReg = {
                id: 10,
                raceNumber: 10
            };
            var mockRace = {
                id: 5,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    },
                    {
                        id: 10,
                        raceNumber: 10
                    }
                ],
                group: 1
            };
            var mockGroup = {
                id: 1,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    },
                    {
                        id: 10,
                        raceNumber: 10
                    }
                ]
            };
            var expected = new Error('Racer already in race');

            sailsMock.mockModel(Registration, 'findOne', mockReg);
            sailsMock.mockModel(Race, 'findOne', mockRace);
            sailsMock.mockModel(Group, 'findOne', mockGroup);
            this.timeout(50);
            raceController.addRacer(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Race.findOne.restore();
                Group.findOne.restore();
                done();
            }, 30);
        });
        it('should add valid racer to race', function (done) {
            var actual;
            var req = {
                body: {
                    event: '1',
                    race: '5',
                    raceNumber: '10'
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
            var mockReg = {
                id: 10,
                raceNumber: 10
            };
            var mockRace = {
                id: 5,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    }
                ],
                group: 1
            };
            var mockGroup = {
                id: 1,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    },
                    {
                        id: 10,
                        raceNumber: 10
                    }
                ]
            };
            var expected = {
                messange: 'Racer added to race',
                race: 5,
                raceNumber: 10
            };

            sailsMock.mockModel(Registration, 'findOne', mockReg);
            sailsMock.mockModel(Race, 'findOne', mockRace);
            sailsMock.mockModel(Group, 'findOne', mockGroup);
            mockRace.registrations.add = function () {
                return true;
            };
            mockRace.save = function () {
                return true;
            };
            this.timeout(50);
            raceController.addRacer(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Race.findOne.restore();
                Group.findOne.restore();
                done();
            }, 30);
        });
    });
    describe('.removeRacer()', function () {
        it('should return error if racer not in race', function (done) {
            var actual;
            var req = {
                body: {
                    event: '1',
                    race: '5',
                    raceNumber: '10'
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
            var mockReg = {
                id: 10,
                raceNumber: 10
            };
            var mockRace = {
                id: 5,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    }
                ],
                group: 1
            };
            var expected = new Error('Racer not in race');

            sailsMock.mockModel(Registration, 'findOne', mockReg);
            sailsMock.mockModel(Race, 'findOne', mockRace);
            this.timeout(50);
            raceController.removeRacer(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Race.findOne.restore();
                done();
            }, 30);
        });
        it('should remove racer from race', function (done) {
            var actual;
            var req = {
                body: {
                    event: '1',
                    race: '5',
                    raceNumber: '10'
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
            var mockReg = {
                id: 10,
                raceNumber: 10
            };
            var mockRace = {
                id: 5,
                registrations: [
                    {
                        id: 1,
                        raceNumber: 1
                    },
                    {
                        id: 10,
                        raceNumber: 10
                    }
                ],
                group: 1
            };
            var expected = {
                messange: 'Racer removed from race',
                race: 5,
                raceNumber: 10
            };

            sailsMock.mockModel(Registration, 'findOne', mockReg);
            sailsMock.mockModel(Race, 'findOne', mockRace);
            mockRace.registrations.remove = function () {
                return true;
            };
            mockRace.save = function () {
                return true;
            };
            this.timeout(50);
            raceController.removeRacer(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Race.findOne.restore();
                done();
            }, 30);
        });
    });
    describe('.assignPacerRfid()', function () {
        it('should assign RFID to pacer', function (done) {
            var actual;
            var req = {
                body: {
                    race: '5',
                    epc: 'abcd0001'
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
            var expected = {
                message: 'Pacer registered',
                race: 5,
                epc: 'abcd0001'
            };

            sailsMock.mockModel(Race, 'update');
            this.timeout(50);
            raceController.assignPacerRfid(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.update.restore();
                done();
            }, 30);
        });
    });
    describe('.updateAdvancingRules()', function () {
        it('should return error if rules not continuous', function (done) {
            var actual;
            var req = {
                body: {
                    race: '5',
                    advancingRules: [
                        {
                            rankFrom: 0,
                            rankTo: 9,
                            toRace: 2,
                            insertAt: 0
                        },
                        {
                            rankFrom: 11,
                            rankTo: 19,
                            toRace: 3,
                            insertAt: 0
                        }
                    ]
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
            var expected = 'Must set rules for continuous rankings';

            this.timeout(50);
            raceController.updateAdvancingRules(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                done();
            }, 30);
        });
        it('should return error if rules not start from 0', function (done) {
            var actual;
            var req = {
                body: {
                    race: '5',
                    advancingRules: [
                        {
                            rankFrom: 1,
                            rankTo: 9,
                            toRace: 2,
                            insertAt: 0
                        },
                        {
                            rankFrom: 10,
                            rankTo: 19,
                            toRace: 3,
                            insertAt: 0
                        }
                    ]
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
            var expected = 'Must set rankFrom from 0';

            this.timeout(50);
            raceController.updateAdvancingRules(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                done();
            }, 30);
        });
        it('should return error if racer count in rules exceed the number of racers', function (done) {
            var actual;
            var req = {
                body: {
                    race: '5',
                    advancingRules: [
                        {
                            rankFrom: 0,
                            rankTo: 9,
                            toRace: 2,
                            insertAt: 0
                        },
                        {
                            rankFrom: 10,
                            rankTo: 19,
                            toRace: 3,
                            insertAt: 0
                        },
                        {
                            rankFrom: 20,
                            rankTo: 30,
                            toRace: 4,
                            insertAt: 0
                        }
                    ]
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
                racerNumberAllowed: 30
            };
            var expected = new Error('Rule setting exceeds max racer');

            sailsMock.mockModel(Race, 'findOne', mock);
            this.timeout(50);
            raceController.updateAdvancingRules(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                done();
            }, 30);
        });
        it('should return error if racer number exceed max racer allowed in advanced race', function (done) {
            var actual;
            var req = {
                body: {
                    race: '5',
                    advancingRules: [
                        {
                            rankFrom: 0,
                            rankTo: 2,
                            toRace: 2,
                            insertAt: 3
                        },
                        {
                            rankFrom: 3,
                            rankTo: 11,
                            toRace: 3,
                            insertAt: 10
                        }
                    ]
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
                racerNumberAllowed: 30
            };
            var mockGroup = {
                id: 1,
                races: [
                    {
                        id: 1,
                        advancingRules: [
                            {
                                rankFrom: 0,
                                rankTo: 2,
                                toRace: 2,
                                insertAt: 0
                            },
                            {
                                rankFrom: 3,
                                rankTo: 11,
                                toRace: 3,
                                insertAt: 0
                            }
                        ]
                    },
                    {
                        id: 2,
                        racerNumberAllowed: 3,
                        advancingRules: []
                    }
                ]
            };
            var expected = new Error('Rule setting exceeds max racer');

            sailsMock.mockModel(Race, 'findOne', mock);
            sailsMock.mockModel(Group, 'findOne', mockGroup);
            this.timeout(50);
            raceController.updateAdvancingRules(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.findOne.restore();
                Group.findOne.restore();
                done();
            }, 30);
        });
        it('should update advancing rules', function (done) {
            var actual;
            var req = {
                body: {
                    race: '5',
                    advancingRules: [
                        {
                            rankFrom: 0,
                            rankTo: 2,
                            toRace: 2,
                            insertAt: 3
                        },
                        {
                            rankFrom: 3,
                            rankTo: 11,
                            toRace: 3,
                            insertAt: 10
                        }
                    ]
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
                racerNumberAllowed: 30
            };
            var mockGroup = {
                id: 1,
                races: [
                    {
                        id: 1,
                        advancingRules: [
                            {
                                rankFrom: 0,
                                rankTo: 2,
                                toRace: 2,
                                insertAt: 0
                            },
                            {
                                rankFrom: 3,
                                rankTo: 11,
                                toRace: 3,
                                insertAt: 0
                            }
                        ]
                    },
                    {
                        id: 2,
                        racerNumberAllowed: 6,
                        advancingRules: []
                    }
                ]
            };
            var expected = {
                message: 'Advancing rules updated',
                race: 5,
                advancingRules: req.body.advancingRules,
                notices: [
                    'There may be overlapped racers in advanced race: 2',
                    'Advanced race spots unfilled: 2',
                    'There may be overlapped racers in advanced race: 3',
                    'Advanced race spots unfilled: 3'
                ]
            };
            var mockUpdate = [{
                id: 5,
                advancingRules: req.body.advancingRules
            }];

            sailsMock.mockModel(Race, 'findOne', mock);
            sailsMock.mockModel(Race, 'update', mockUpdate);
            sailsMock.mockModel(Group, 'findOne', mockGroup);
            this.timeout(99);
            raceController.updateAdvancingRules(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Race.update.restore();
                Race.findOne.restore();
                Group.findOne.restore();
                done();
            }, 60);
        });
    });
    /*
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
