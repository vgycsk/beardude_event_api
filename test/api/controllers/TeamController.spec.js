/* eslint-disable no-magic-numbers */
/* global describe, it, Team */

var teamController = require('../../../api/controllers/TeamController.js');
var sailsMock = require('sails-mock-models');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(chaiAsPromised);
describe('/controllers/TeamController', function() {
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

            this.timeout(200);
            sailsMock.mockModel(Team, 'findOne', mockData);
            teamController.getInfo(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.findOne.restore();
                done();
            }, 100);
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

            this.timeout(200);
            sailsMock.mockModel(Team, 'findOne', mockData);
            sailsMock.mockModel(Team, 'update', mockUpdate);
            teamController.update(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Team.findOne.restore();
                Team.update.restore();
                done();
            }, 100);
        });
    });
});
