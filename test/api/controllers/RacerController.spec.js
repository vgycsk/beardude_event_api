/* eslint-disable no-magic-numbers */
/* global afterEach, accountService, beforeEach, describe, it, Racer */

var racerController = require('../../../api/controllers/RacerController.js');
var sailsMock = require('sails-mock-models');
var sinon = require('sinon');
var bcrypt = require('bcrypt-nodejs');
var chai = require('chai');
var expect = chai.expect;

describe('/controllers/RacerController', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });
    describe('.racerExist()', function () {
        it('should return racer not found message if racer not exist', function (done) {
            var actual;
            var req = {
                body: {
                    email: 'info@beardude.com'
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                racer: 'info@beardude.com',
                exist: false
            };

            sailsMock.mockModel(Racer, 'findOne');
            racerController.racerExist(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Racer.findOne.restore();
                done();
            }, 25);
        });
        it('should return racer exist message if racer found', function (done) {
            var actual;
            var req = {
                body: {
                    email: 'info@beardude.com'
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                racer: 'info@beardude.com',
                exist: true
            };
            var mock = {
                id: 1,
                email: 'info@beardude.com'
            };

            sailsMock.mockModel(Racer, 'findOne', mock);
            racerController.racerExist(req, res);
            this.timeout(50);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Racer.findOne.restore();
                done();
            }, 25);
        });
    });
    describe('.activate()', function () {
        it('should call accountService.activate', function (done) {
            var req = {};
            var res = {};
            var actual;

            sandbox.stub(accountService, 'activate').callsFake(function () {
                actual = true;
            });
            racerController.activate(req, res);
            expect(actual).to.equal(true);
            done();
        });
    });
    describe('.getGeneralInfo()', function () {
        it('should return filtered info', function (done) {
            var actual;
            var req = {
                params: {
                    id: 1
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                isActive: true
            };
            var expected = {
                firstName: 'John',
                lastName: 'Doe',
                isActive: true
            };

            sailsMock.mockModel(Racer, 'findOne', mock);
            racerController.getGeneralInfo(req, res);
            this.timeout(150);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Racer.findOne.restore();
                done();
            }, 50);
        });
    });

    describe('.getManagementInfo()', function () {
        it('should return complete info', function (done) {
            var actual;
            var req = {
                params: {
                    id: 1
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var mock = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                isActive: true,
                password: '123'
            };
            var expected = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                isActive: true
            };

            sailsMock.mockModel(Racer, 'findOne', mock);
            racerController.getManagementInfo(req, res);
            this.timeout(150);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Racer.findOne.restore();
                done();
            }, 50);
        });
    });

    describe('.login()', function () {
        it('should return message if already logged in', function (done) {
            var actual;
            var req = {
                session: {
                    racerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = 'Already logged in';

            racerController.login(req, res);
            expect(actual).to.equal(expected);
            done();
        });
        it('should return error message if password incorrect', function (done) {
            var actual;
            var req = {
                body: {
                    email: 'info@beardude.com',
                    password: '1234'
                },
                session: {}
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = new Error('Credentials incorrect');
            var mock;
            var that = this;

            return bcrypt.hash('123', null, null, function (err, hash) {
                if (err) {
                    expect(true).to.equal(false);
                    return done();
                }
                mock = {
                    id: 1,
                    email: 'info@beardude.com',
                    password: hash
                };
                sailsMock.mockModel(Racer, 'findOne', mock);
                that.timeout(800);
                racerController.login(req, res);
                return setTimeout(function () {
                    expect(actual).to.deep.equal(expected);
                    Racer.findOne.restore();
                    return done();
                }, 300);
            });
        });
        it('should return logged in user and create session data', function (done) {
            var actual;
            var req = {
                body: {
                    email: 'info@beardude.com',
                    password: '123'
                },
                session: {}
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Logged in',
                email: 'info@beardude.com'
            };
            var mock;
            var that = this;

            return bcrypt.hash('123', null, null, function (err, hash) {
                if (err) {
                    expect(true).to.equal(false);
                    return done();
                }
                mock = {
                    id: 1,
                    email: 'info@beardude.com',
                    password: hash
                };
                sailsMock.mockModel(Racer, 'findOne', mock);
                that.timeout(800);
                racerController.login(req, res);
                return setTimeout(function () {
                    expect(actual).to.deep.equal(expected);
                    expect(req.session).to.deep.equal({
                        racerInfo: mock
                    });
                    Racer.findOne.restore();
                    return done();
                }, 300);
            });
        });
    });
    describe('.logout()', function () {
        it('should remove session data', function (done) {
            var actual;
            var req = {
                session: {
                    racerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Logged out'
            };

            racerController.logout(req, res);
            expect(req.session).to.deep.equal({});
            expect(actual).to.deep.equal(expected);
            done();
        });
    });

    describe('.reissuePassword()', function () {
        it('should call accountService.reissuePassword', function (done) {
            var req = {};
            var res = {};
            var actual;

            sandbox.stub(accountService, 'reissuePassword').callsFake(function () {
                actual = true;
            });
            racerController.reissuePassword(req, res);
            expect(actual).to.equal(true);
            done();
        });
    });
    describe('.update()', function () {
        it('should call accountService.update', function (done) {
            var req = {};
            var res = {};
            var actual;

            sandbox.stub(accountService, 'update').callsFake(function () {
                actual = true;
            });
            racerController.update(req, res);
            expect(actual).to.equal(true);
            done();
        });
    });
    describe('.updatePassword()', function () {
        it('should call accountService.updatePassword', function (done) {
            var req = {};
            var res = {};
            var actual;

            sandbox.stub(accountService, 'updatePassword').callsFake(function () {
                actual = true;
            });
            racerController.updatePassword(req, res);
            expect(actual).to.equal(true);
            done();
        });
    });
});
