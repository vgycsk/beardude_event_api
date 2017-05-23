/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Team */

var teamController = require('../../../api/controllers/TeamController.js');
var sailsMock = require('sails-mock-models');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var Q = require('q');
var sinon = require('sinon');

chai.use(chaiAsPromised);
describe('/controllers/TeamController', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });
    describe('.teamExist()', function () {
        it('should return team not found message if team not exist', function (done) {
            var actual;
            var req = {
                body: {
                    name: 'Team Murica'
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
                name: 'Team Murica',
                exist: false
            };

            sailsMock.mockModel(Team, 'findOne');
            teamController.teamExist(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.findOne.restore();
                done();
            }, 25);
        });
        it('should return team exist message if team found', function (done) {
            var actual;
            var req = {
                body: {
                    name: 'Team Murica'
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                name: 'Team Murica',
                exist: true
            };
            var mock = {
                id: 1,
                name: 'Team Murica'
            };

            sailsMock.mockModel(Team, 'findOne', mock);
            teamController.teamExist(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.findOne.restore();
                done();
            }, 25);
        });
    });
    describe('.createTeam()', function () {
        // {name: STR, desc: STR, url: STR}
        it('should create team', function (done) {
            var actual;
            var obj = {
                name: 'Team Murica',
                desc: 'The best of the best of the best',
                url: 'http://team-murica.cafe'
            };

            var mock = obj;
            var expected;

            mock.id = 1;
            expected = mock;
            sailsMock.mockModel(Team, 'create', mock);
            sandbox.stub(Q, 'defer').callsFake(function () {
                return {
                    resolve: function (obj) {
                        actual = obj;
                    },
                    reject: function (obj) {
                        actual = obj;
                    }
                };
            });
            teamController.createTeam(obj);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.create.restore();
                done();
            }, 25);
        });
    });
    describe('.getInfo()', function () {
        it('should return team info', function (done) {
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
                name: 'new team',
                nameCht: '新隊伍',
                racers: [
                    {
                        id: 1,
                        firstName: 'Jane'
                    },
                    {
                        id: 2,
                        firstName: 'John'
                    }
                ],
                leader: 1
            };
            var expected = {
                id: 1,
                name: 'new team',
                nameCht: '新隊伍',
                racers: [
                    {
                        id: 1,
                        firstName: 'Jane'
                    },
                    {
                        id: 2,
                        firstName: 'John'
                    }
                ],
                leader: {
                    id: 1,
                    firstName: 'Jane'
                }
            };

            this.timeout(99);
            sailsMock.mockModel(Team, 'findOne', mockData);
            teamController.getInfo(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.findOne.restore();
                done();
            }, 50);
        });
    });
    describe('.update()', function () {
        it('should update changed fields', function (done) {
            var actual;
            var req = {
                body: {
                    name: 'new team name'
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
                name: 'new team',
                nameCht: '新隊伍',
                leader: 1
            };
            var mockUpdate = [
                {
                    id: 1,
                    name: 'new team name',
                    nameCht: '新隊伍',
                    leader: 1
                }
            ];
            var expected = {
                message: 'Team updated',
                team: {
                    id: 1,
                    name: 'new team name',
                    nameCht: '新隊伍',
                    leader: 1
                }
            };

            this.timeout(99);
            sailsMock.mockModel(Team, 'findOne', mockData);
            sailsMock.mockModel(Team, 'update', mockUpdate);
            teamController.update(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.findOne.restore();
                Team.update.restore();
                done();
            }, 50);
        });
    });
});
