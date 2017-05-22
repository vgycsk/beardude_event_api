/* eslint-disable no-magic-numbers */
/* global afterEach, accountService, beforeEach, describe, it, Manager */

var managerController = require('../../../api/controllers/ManagerController.js');
var sailsMock = require('sails-mock-models');
var sinon = require('sinon');
var bcrypt = require('bcrypt-nodejs');
var chai = require('chai');
var expect = chai.expect;
var Q = require('q');

describe('/controllers/ManagerController', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });
    describe('.activate()', function () {
        it('should call accountService.activate', function (done) {
            var req = {};
            var res = {};
            var actual;

            sandbox.stub(accountService, 'activate').callsFake(function () {
                actual = true;
            });
            managerController.activate(req, res);
            expect(actual).to.equal(true);
            done();
        });
    });
    describe('.create()', function () {
        it('should return error if password mismatch', function (done) {
            var actual;
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '456'
                }
            };
            var res = {
                badRequest: function (obj) {
                    actual = obj;
                }
            };
            var expected = 'Password and confirm-password mismatch';

            managerController.create(req, res);
            expect(actual).to.equal(expected);
            done();
        });
        it('should call accountService and create account', function (done) {
            var actual;
            var req = {
                body: {
                    email: 'info@beardude.com',
                    password: '123',
                    confirmPassword: '123'
                }
            };
            var res = {
                ok: function (obj) {
                    actual = obj;
                }
            };
            var expected = {
                message: 'Account created',
                manager: {
                    id: 1
                }
            };

            sandbox.stub(accountService, 'create').callsFake(function () {
                var q = Q.defer();

                q.resolve({
                    id: 1
                });
                return q.promise;
            });
            managerController.create(req, res);
            this.timeout(100);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                done();
            }, 50);
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

            sailsMock.mockModel(Manager, 'findOne', mock);
            managerController.getGeneralInfo(req, res);
            this.timeout(150);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Manager.findOne.restore();
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

            sailsMock.mockModel(Manager, 'findOne', mock);
            managerController.getManagementInfo(req, res);
            this.timeout(150);
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Manager.findOne.restore();
                done();
            }, 50);
        });
    });

    describe('.login()', function () {
        it('should return message if already logged in', function (done) {
            var actual;
            var req = {
                session: {
                    managerInfo: {
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

            managerController.login(req, res);
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
                sailsMock.mockModel(Manager, 'findOne', mock);
                that.timeout(1000);
                managerController.login(req, res);
                return setTimeout(function () {
                    expect(actual).to.deep.equal(expected);
                    Manager.findOne.restore();
                    return done();
                }, 500);
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
                sailsMock.mockModel(Manager, 'findOne', mock);
                that.timeout(1000);
                managerController.login(req, res);
                return setTimeout(function () {
                    expect(actual).to.deep.equal(expected);
                    expect(req.session).to.deep.equal({
                        managerInfo: mock
                    });
                    Manager.findOne.restore();
                    return done();
                }, 500);
            });
        });
    });
    describe('.logout()', function () {
        it('should remove session data', function (done) {
            var actual;
            var req = {
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
                }
            };
            var expected = {
                message: 'Logged out'
            };

            managerController.logout(req, res);
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
            managerController.reissuePassword(req, res);
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
            managerController.update(req, res);
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
            managerController.updatePassword(req, res);
            expect(actual).to.equal(true);
            done();
        });
    });
});
