/* eslint-disable no-magic-numbers, no-undefined */
/* global afterEach, accountService, beforeEach, dataService, describe, it, Registration */

var registrationController = require('../../../api/controllers/RegistrationController.js');
var sailsMock = require('sails-mock-models');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Q = require('q');

describe('/controllers/RegistrationController', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });
    describe('.signupAndCreate()', function () {
        it('should create a racer account and register for an event', function (done) {
            var actual;
            var req = {
                body: {
                    group: 1,
                    event: 1,
                    racer: {
                        email: 'info@beardude.com',
                        firstName: 'Jane'
                    }
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Registered successfully',
                group: 1,
                racer: {
                    id: 1,
                    email: 'info@beardude.com',
                    firstName: 'Jane'
                },
                accessCode: undefined
            };
            var mock = {
                id: 1,
                event: 1,
                group: 1
            };

            sandbox.stub(accountService, 'create').callsFake(function () {
                var q = Q.defer();

                q.resolve({
                    id: 1,
                    email: 'info@beardude.com',
                    firstName: 'Jane'
                });
                return q.promise;
            });
            sandbox.stub(dataService, 'returnAccessCode').callsFake(function () {
                var q = Q.defer();

                q.resolve('');
                return q.promise;
            });
            sailsMock.mockModel(Registration, 'create', mock);
            registrationController.signupAndCreate(req, res);
            this.timeout(99);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.create.restore();
                done();
            }, 50);
        });
    });
    describe('.create()', function () {
        it('should return registration exist if already registered', function (done) {
            var actual;
            var req = {
                body: {
                    group: 1,
                    event: 1,
                    racer: 1
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
            var expected = new Error('Already registered');
            var mock = {
                id: 1,
                event: 1,
                group: 1
            };

            sailsMock.mockModel(Registration, 'findOne', mock);
            registrationController.create(req, res);
            this.timeout(99);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                done();
            }, 50);
        });
        it('should register for an event', function (done) {
            var actual;
            var req = {
                body: {
                    group: 1,
                    event: 1,
                    racer: 1
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Registered successfully',
                group: 1,
                racer: 1,
                accessCode: undefined
            };
            var mock = {
                id: 1,
                email: 'info@beardude.com',
                firstName: 'Jane',
                event: 1,
                group: 1
            };

            sandbox.stub(dataService, 'returnAccessCode').callsFake(function () {
                var q = Q.defer();

                q.resolve('');
                return q.promise;
            });
            sailsMock.mockModel(Registration, 'findOne');
            sailsMock.mockModel(Registration, 'create', mock);
            registrationController.create(req, res);
            this.timeout(99);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Registration.create.restore();
                done();
            }, 50);
        });
    });
    describe('.getInfo()', function () {
        it('should return registration info', function (done) {
            var actual;
            var req = {
                body: {
                    event: '1'
                },
                session: {
                    racerInfo: {
                        id: 1
                    }
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                races: [{
                    id: 1
                }, {
                    id: 2
                }],
                event: 1,
                group: 1,
                accessCode: 'abcd',
                raceNumber: 1,
                paid: false,
                rfidRecycled: false,
                refundRequested: false,
                refunded: false
            };
            var expected = {
                races: [{
                    id: 1
                }, {
                    id: 2
                }],
                event: 1,
                group: 1,
                accessCode: 'abcd',
                raceNumber: 1,
                paid: false,
                rfidRecycled: false,
                refundRequested: false,
                refunded: false
            };

            sailsMock.mockModel(Registration, 'findOne', mock);
            registrationController.getInfo(req, res);
            this.timeout(99);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                done();
            }, 50);
        });
    });
    describe('.assignRfid()', function () {
        it('should return error if racer already has RFID', function (done) {
            var actual;
            var mock = {
                id: 1,
                epc: 'abc123'
            };
            var req = {
                body: {
                    event: 1,
                    accessCode: 'aaa',
                    epc: 'abc000'
                }
            };
            var res = {
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = new Error('Racer already has RFID');

            sailsMock.mockModel(Registration, 'findOne', mock);
            registrationController.assignRfid(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                done();
            }, 25);
        });
        it('should return error if RFID already assigned to another racer', function (done) {
            var actual;
            var req = {
                body: {
                    event: 1,
                    accessCode: 'aaa',
                    epc: 'abc000'
                }
            };
            var mock = {
                id: 1
            };
            var res = {
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = new Error('RFID already assigned to another racer');

            sailsMock.mockModel(Registration, 'findOne', mock);
            registrationController.assignRfid(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                done();
            }, 25);
        });
        it('should assign RFID', function (done) {
            var actual;
            var req = {
                body: {
                    event: 1,
                    accessCode: 'aaa',
                    epc: 'abc000'
                }
            };
            var mock = {
                id: 1
            };
            var mockUpdate = [{
                id: 1,
                raceNumber: 1
            }];
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Rfid assigned',
                raceNumber: 1
            };

            sailsMock.mockModel(Registration, 'findOne', mock);
            sailsMock.mockModel(Registration, 'update', mockUpdate);
            registrationController.assignRfid(req, res);
            Registration.findOne.restore();
            sailsMock.mockModel(Registration, 'findOne');
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Registration.update.restore();
                done();
            }, 25);
        });
    });
    describe('.replaceRfid()', function () {
        it('should return error if racer not assigned RFID yet', function (done) {
            var actual;
            var mock = {
                id: 1
            };
            var req = {
                body: {
                    event: 1,
                    raceNumber: 1,
                    epc: 'abc000'
                }
            };
            var res = {
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = new Error('Racer not assigned RFID yet');

            sailsMock.mockModel(Registration, 'findOne', mock);
            registrationController.replaceRfid(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                done();
            }, 25);
        });
        it('should return error if RFID already assigned to another racer', function (done) {
            var actual;
            var req = {
                body: {
                    event: 1,
                    raceNumber: 1,
                    epc: 'abc000'
                }
            };
            var mock = {
                id: 1,
                epc: 'abc001'
            };
            var mock1 = {
                id: 2,
                epc: 'abc000'
            };
            var res = {
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = new Error('RFID already assigned to another racer');

            sailsMock.mockModel(Registration, 'findOne', mock);
            registrationController.replaceRfid(req, res);
            Registration.findOne.restore();
            sailsMock.mockModel(Registration, 'findOne', mock1);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                done();
            }, 25);
        });
        it('should replace RFID', function (done) {
            var actual;
            var req = {
                body: {
                    event: 1,
                    raceNumber: 1,
                    epc: 'abc000'
                }
            };
            var mock = {
                id: 1,
                epc: 'abc001'
            };
            var mockUpdate = [{
                id: 1,
                epc: 'abc001',
                raceNumber: 1
            }];
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Rfid replaced',
                raceNumber: 1
            };

            sailsMock.mockModel(Registration, 'findOne', mock);
            sailsMock.mockModel(Registration, 'update', mockUpdate);
            registrationController.replaceRfid(req, res);
            Registration.findOne.restore();
            sailsMock.mockModel(Registration, 'findOne');
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Registration.findOne.restore();
                Registration.update.restore();
                done();
            }, 25);
        });
    });
    /*
    describe('.recycleRfid()', function () {
        it('should ', function (done) {
        });
    });
    describe('.updatePayment()', function () {
        it('should ', function (done) {
        });
    });
    describe('.requestRefund()', function () {
        it('should ', function (done) {
        });
    });
    describe('.refunded()', function () {
        it('should ', function (done) {
        });
    });
    describe('.confirmRegistration()', function () {
        it('should ', function (done) {
        });
    });
    describe('.admitRacer()', function () {
        it('should ', function (done) {
        });
    });
    describe('.updateDisqualification()', function () {
        it('should ', function (done) {
        });
    });
    describe('.updateRaceNote()', function () {
        it('should ', function (done) {
        });
    });
    */
});
