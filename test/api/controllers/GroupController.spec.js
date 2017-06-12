/* eslint-disable no-magic-numbers */
/* global describe, Group, it, Race, Registration, Team */

var groupController = require('../../../api/controllers/GroupController.js');
var sailsMock = require('sails-mock-models');
var chai = require('chai');
var expect = chai.expect;

describe('/controllers/GroupController', function() {
    describe('.create()', function () {
        it('should create a group', function (done) {
            var actual;
            var req = {
                body: {
                    name: 'new group',
                    nameCht: '新組別'
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
                id: 1,
                name: 'new group',
                nameCht: '新組別'
            };
            var expected = {
                message: 'Group created',
                group: mockData
            };

            this.timeout(99);
            sailsMock.mockModel(Group, 'create', mockData);
            groupController.create(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Group.create.restore();
                done();
            }, 30);
        });
    });
    describe('.getInfo()', function () {
        it('should return filtered group info', function (done) {
            var actual;
            var req = {
                params: {
                    id: '1'
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
                id: 1,
                name: 'new group'
            };
            var mockTeam = [
                {
                    id: 1,
                    name: '隊伍1',
                    leader: 1
                },
                {
                    id: 2,
                    name: '隊伍2',
                    leader: 5
                }
            ];
            var mockDataReg = [
                {
                    id: 1,
                    racer: {
                        id: 1,
                        team: 1,
                        firstName: 'John',
                        lastName: 'Doe',
                        nickName: 'JD'
                    },
                    raceNumber: 1
                }
            ];
            var expected = {
                id: 1,
                name: 'new group',
                teams: mockTeam,
                registrations: [
                    {
                        racer: {
                            id: 1,
                            team: 1,
                            firstName: 'John',
                            lastName: 'Doe',
                            nickName: 'JD'
                        },
                        raceNumber: 1
                    }
                ]
            };

            mockData.toJSON = function () {
                return mockData;
            };
            this.timeout(99);
            sailsMock.mockModel(Group, 'findOne', mockData);
            sailsMock.mockModel(Team, 'find', mockTeam);
            sailsMock.mockModel(Registration, 'find', mockDataReg);
            groupController.getInfo(req, res);
            setTimeout(function () {
                delete mockData.toJSON;
                expect(actual).to.deep.equal(expected);
                Group.findOne.restore();
                Team.find.restore();
                Registration.find.restore();
                done();
            }, 30);
        });
    });
    describe('.getManagementInfo()', function () {
        it('should return complete group info', function (done) {
            var actual;
            var req = {
                params: {
                    id: '1'
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
                id: 1,
                name: 'new group'
            };
            var mockTeam = [
                {
                    id: 1,
                    name: '隊伍1',
                    leader: 1
                },
                {
                    id: 2,
                    name: '隊伍2',
                    leader: 5
                }
            ];
            var mockDataReg = [
                {
                    id: 1,
                    racer: {
                        team: 1,
                        firstName: 'John',
                        lastName: 'Doe',
                        nickName: 'JD'
                    },
                    raceNumber: 1
                }
            ];
            var expected = {
                id: 1,
                name: 'new group',
                teams: mockTeam,
                registrations: mockDataReg
            };

            this.timeout(99);
            sailsMock.mockModel(Group, 'findOne', mockData);
            sailsMock.mockModel(Team, 'find', mockTeam);
            sailsMock.mockModel(Registration, 'find', mockDataReg);
            groupController.getManagementInfo(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Group.findOne.restore();
                Team.find.restore();
                Registration.find.restore();
                done();
            }, 30);
        });
    });

    describe('.delete()', function () {
        it('should return error if event has registrations', function (done) {
            var actual;
            var req = {
                params: {
                    id: '1'
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
                id: 1,
                name: 'new group',
                registrations: [1, 2, 3]
            };
            var expected = 'Cannot delete group that has racers registered';

            this.timeout(99);
            sailsMock.mockModel(Group, 'findOne', mockData);
            groupController.delete(req, res);
            setTimeout(function () {
                expect(actual.message).to.equal(expected);
                Group.findOne.restore();
                done();
            }, 30);
        });
        it('should remove empty group', function (done) {
            var actual;
            var req = {
                params: {
                    id: '1'
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
                id: 1,
                name: 'new group',
                registrations: [],
                races: []
            };
            var expected = {
                message: 'Group deleted',
                group: 1,
                races: []
            };

            this.timeout(99);
            sailsMock.mockModel(Group, 'findOne', mockData);

            groupController.delete(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Group.findOne.restore();
                done();
            }, 30);
        });
        it('should remove group', function (done) {
            var actual;
            var req = {
                params: {
                    id: '1'
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
                id: 1,
                name: 'new group',
                registrations: [],
                races: [
                    {
                        id: 1
                    },
                    {
                        id: 2
                    },
                    {
                        id: 3
                    }
                ]
            };
            var expected = {
                message: 'Group deleted',
                group: 1,
                races: [1, 2, 3]
            };

            this.timeout(99);
            sailsMock.mockModel(Group, 'findOne', mockData);
            sailsMock.mockModel(Race, 'destroy');

            groupController.delete(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Group.findOne.restore();
                Race.destroy.restore();
                done();
            }, 30);
        });
    });
    describe('.update()', function () {
        it('should update specified fields', function (done) {
            var actual;
            var req = {
                body: {
                    id: 1,
                    name: 'new group1'
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
            var mock = [{
                id: 1,
                name: 'new group1'
            }];
            var expected = {
                message: 'Group updated',
                group: mock[0]
            };

            this.timeout(99);
            sailsMock.mockModel(Group, 'update', mock);
            groupController.update(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Group.update.restore();
                done();
            }, 30);
        });
    });
});
