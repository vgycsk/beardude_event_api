/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var accountService = require('../../../api/services/accountService.js');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var sailsMock = require('sails-mock-models');
var sinon = require('sinon');

chai.use(chaiAsPromised);
describe('services/accountService', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('activate()', function () {
        it('should return error message if passwords not specified', function (done) {
            var req = {
                body: {
                    password: '',
                    confirmPassword: ''
                },
                session: {
                    managerInfo: {
                        email: 'info@beardude.com'
                    }
                }
            };
            var actual;
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Please enter password';

            accountService.activate(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('should return error message if password and confirm password mismatch', function (done) {
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '456'
                },
                session: {
                    managerInfo: {
                        email: 'info@beardude.com'
                    }
                }
            };
            var actual;
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Password and confirm-password mismatch';

            accountService.activate(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('should return error message if not logged in', function (done) {
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '123'
                },
                session: {}
            };
            var actual;
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Please login';

            accountService.activate(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('should activate account', function (done) {
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '123'
                },
                session: {
                    managerInfo: {
                        email: 'info@beardude.com'
                    }
                }
            };
            var actual;
            var res = {
                ok: function (msg) {
                    actual = msg;
                },
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var mockData = {
                email: 'info@beardude.com',
                password: 'old',
                isActive: true
            };
            var expected = {
                message: 'Account activated',
                email: 'info@beardude.com'
            };

            sailsMock.mockModel(Manager, 'update', mockData);
            accountService.activate(req, res, 'Manager')
            .then(function () {
                expect(actual).to.deep.equal(expected);
                done();
            });
        });
    });
    /*
    describe('create()', function () {});
    describe('login()', function () {});
    describe('reissuePassword()', function () {});
    describe('update()', function () {});
    describe('updatePassword()', function () {});
    */
});
