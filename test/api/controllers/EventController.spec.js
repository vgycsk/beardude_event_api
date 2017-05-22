/* eslint-disable no-magic-numbers */
/* global describe, Event, it, Manager */

var eventController = require('../../../api/controllers/EventController.js');
var sailsMock = require('sails-mock-models');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(chaiAsPromised);
describe('/controllers/EventController', function() {
    describe('.create()', function () {
        it('should create an event under current manager', function (done) {
            var actual;
            var req = {
                body: {
                    name: 'new event',
                    nameCht: '新比賽',
                    assignedRaceNumber: 60,
                    startTime: '2017-10-10T08:00:00-08:00',
                    endTime: '2017-10-10T16:00:00-08:00',
                    lapDistance: 1100,
                    location: 'Taipei'
                },
                session: {
                    managerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
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
            var mockData = req.body;
            var mockDataManager = {
                id: 1,
                events: {
                    add: function () {
                        return true;
                    }
                },
                save: function () {
                    return true;
                }
            };
            var expected = {
                message: 'Event created',
                event: req.body
            };

            this.timeout(200);
            mockData.isPublic = false;
            sailsMock.mockModel(Event, 'create', mockData);
            sailsMock.mockModel(Manager, 'findOne', mockDataManager);
            eventController.create(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.create.restore();
                Manager.findOne.restore();
                done();
            }, 100);
        });
    });
    describe('.getGeneralInfo()', function () {
        it('should return event info if found', function (done) {
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
                name: 'new event',
                nameCht: '新活動'
            };
            var expected = mockData;

            this.timeout(120);
            sailsMock.mockModel(Event, 'findOne', mockData);
            eventController.getGeneralInfo(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.findOne.restore();
                done();
            }, 100);
        });
    });
    describe('.addManagers()', function () {
        it('should return error if entered manager already exist', function (done) {
            var actual;
            var req = {
                body: {
                    event: 1,
                    managers: [1, 2]
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
                name: 'new event',
                nameCht: '新活動',
                managers: [1, 2]
            };
            var expected = new Error('No managers to add');

            this.timeout(120);
            sailsMock.mockModel(Event, 'findOne', mockData);
            eventController.addManagers(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.findOne.restore();
                done();
            }, 100);
        });
        it('should add unexist manager', function (done) {
            var actual;
            var addedManager = [];
            var req = {
                body: {
                    event: 1,
                    managers: [1, 2, 3]
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
                name: 'new event',
                nameCht: '新活動',
                managers: [1, 2],
                save: function () {
                    return true;
                }
            };
            var expected = {
                message: 'Managers added to event',
                event: 1,
                managers: [3]
            };

            mockData.managers.add = function (id) {
                addedManager.push(id);
            };
            this.timeout(120);
            sailsMock.mockModel(Event, 'findOne', mockData);
            eventController.addManagers(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.findOne.restore();
                done();
            }, 100);
        });
    });
    describe('.removeManagers()', function () {
        it('should return error if entered manager does not exist', function (done) {
            var actual;
            var req = {
                body: {
                    event: 1,
                    managers: [1, 2]
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
                name: 'new event',
                nameCht: '新活動',
                managers: [3, 4]
            };
            var expected = new Error('No managers to remove');

            this.timeout(120);
            sailsMock.mockModel(Event, 'findOne', mockData);
            eventController.removeManagers(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.findOne.restore();
                done();
            }, 100);
        });
        it('should remove manager from event', function (done) {
            var actual;
            var removedManager = [];
            var req = {
                body: {
                    event: 1,
                    managers: [1, 2, 3]
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
                name: 'new event',
                nameCht: '新活動',
                managers: [1, 2, 3, 4, 5],
                save: function () {
                    return true;
                }
            };
            var expected = {
                message: 'Managers removed from event',
                event: 1,
                managers: [1, 2, 3]
            };

            mockData.managers.remove = function (id) {
                removedManager.push(id);
            };
            this.timeout(120);
            sailsMock.mockModel(Event, 'findOne', mockData);
            eventController.removeManagers(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.findOne.restore();
                done();
            }, 100);
        });
    });
    describe('.update()', function () {
        it('should update specified fields', function (done) {
            var actual;
            var req = {
                body: {
                    name: 'new event1',
                    assignedRaceNumber: 50,
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
            var mockData = req.body;
            var mockDataUpdate = [{
                id: 1,
                name: 'new event1',
                assignedRaceNumber: 50
            }];
            var expected = {
                message: 'Event updated',
                event: mockDataUpdate[0]
            };

            mockData.id = 1;
            this.timeout(200);
            sailsMock.mockModel(Event, 'create', mockData);
            sailsMock.mockModel(Event, 'update', mockDataUpdate);

            eventController.update(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.create.restore();
                Event.update.restore();
                done();
            }, 100);
        });
    });
    describe('.updateSwitch()', function () {
        it('should update specified fields', function (done) {
            var actual;
            var req = {
                body: {
                    isRegistrationOpen: true,
                    isTeamRegistrationOpen: true,
                    isPublic: true
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
            var mockDataUpdate = [{
                id: 1,
                name: 'new event1',
                isRegistrationOpen: true,
                isTeamRegistrationOpen: true,
                isPublic: true
            }];
            var expected = {
                message: 'Event boolean field(s) updated',
                event: mockDataUpdate[0]
            };

            this.timeout(200);
            sailsMock.mockModel(Event, 'update', mockDataUpdate);

            eventController.updateSwitch(req, res);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Event.update.restore();
                done();
            }, 100);
        });
    });
});
