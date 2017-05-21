/* eslint-disable no-magic-numbers */
/* global Address, afterEach, beforeEach, describe, it, Manager, Racer */

var accountService = require('../../../api/services/accountService.js');
var bcrypt = require('bcrypt-nodejs');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var sailsMock = require('sails-mock-models');
var randomstring = require('randomstring');
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
        it('should activate manager account', function (done) {
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
                Manager.update.restore();
                done();
            });
        });
        it('should activate racer account', function (done) {
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '123'
                },
                session: {
                    racerInfo: {
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

            sailsMock.mockModel(Racer, 'update', mockData);
            accountService.activate(req, res, 'Racer')
            .then(function () {
                expect(actual).to.deep.equal(expected);
                Racer.update.restore();
                done();
            });
        });
    });
    describe('create()', function () {
        it('Should return password mismatch if password and confirm password do not match', function (done) {
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '456'
                }
            };
            var actual;
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Password and confirm-password mismatch';

            accountService.create(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('Should return account exist if email already registered', function (done) {
            var req = {
                body: {
                    password: '123',
                    confirmPassword: '123'
                }
            };
            var actual;
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = new Error('Account exists');
            var mockData = {
                id: 5,
                email: 'info@beardude.com'
            };

            sailsMock.mockModel(Manager, 'findOne', mockData);
            accountService.create(req, res, 'Manager');
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Manager.findOne.restore();
                done();
            }, 10);
        });
        it('Should create inactive account if password not specified', function (done) {
            var req = {
                body: {
                    email: 'info@beardude.com',
                    password: '',
                    confirmPassword: ''
                }
            };
            var actual;
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = {
                message: 'Account created',
                accountType: 'Manager',
                account: {
                    id: 5,
                    email: 'info@beardude.com',
                    password: 'PewPewPew',
                    address: {
                        id: 1,
                        street: '123'
                    }
                }
            };
            var mockData = {
                id: 5,
                email: 'info@beardude.com'
            };
            var mockAddress = {
                id: 1,
                street: '123'
            };

            sandbox.stub(randomstring, 'generate', function () {
                return 'PewPewPew';
            });
            sailsMock.mockModel(Address, 'create', mockAddress);
            sailsMock.mockModel(Manager, 'findOne');
            sailsMock.mockModel(Manager, 'create', mockData);
            accountService.create(req, res, 'Manager');
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Address.create.restore();
                Manager.findOne.restore();
                Manager.create.restore();
                done();
            }, 100);
        });
        it('Should create active account if password specified', function (done) {
            var req = {
                body: {
                    email: 'info@beardude.com',
                    password: '123abc',
                    confirmPassword: '123abc'
                }
            };
            var actual;
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = {
                message: 'Account created',
                accountType: 'Manager',
                account: {
                    id: 5,
                    email: 'info@beardude.com',
                    address: {
                        id: 1,
                        street: '123'
                    }
                }
            };
            var mockData = {
                id: 5,
                email: 'info@beardude.com'
            };
            var mockAddress = {
                id: 1,
                street: '123'
            };

            sailsMock.mockModel(Address, 'create', mockAddress);
            sailsMock.mockModel(Manager, 'findOne');
            sailsMock.mockModel(Manager, 'create', mockData);
            accountService.create(req, res, 'Manager');
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Address.create.restore();
                Manager.findOne.restore();
                Manager.create.restore();
                done();
            }, 100);
        });
    });
    describe('reissuePassword()', function () {
        it('cannot reissue password to active account', function (done) {
            var req = {
                params: {
                    id: '3'
                }
            };
            var actual;
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = new Error('Cannot reissue password to activated account');
            var mockData = {
                id: 5,
                email: 'info@beardude.com',
                isActive: true
            };

            sailsMock.mockModel(Manager, 'findOne', mockData);
            accountService.reissuePassword(req, res, 'Manager');
            Manager.findOne.restore();
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                done();
            }, 10);
        });
        it('should reissue password to inactive account', function (done) {
            var req = {
                params: {
                    id: '3'
                }
            };
            var actual;
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = {
                message: 'Temporary password created',
                password: 'PewPewPew'
            };
            var mockData = {
                id: 5,
                email: 'info@beardude.com',
                isActive: false
            };
            var mockData1 = {
                id: 1,
                email: 'info@beardude.com',
                firstName: 'Jane',
                Doe: 'Doh'
            };

            sandbox.stub(randomstring, 'generate', function () {
                return 'PewPewPew';
            });
            sailsMock.mockModel(Manager, 'findOne', mockData);
            sailsMock.mockModel(Manager, 'update', mockData1);
            accountService.reissuePassword(req, res, 'Manager');
            Manager.findOne.restore();
            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Manager.update.restore();
                done();
            }, 10);
        });
    });
    describe('update()', function () {
        it('should update account', function (done) {
            var req = {
                body: {
                    id: 1,
                    firstName: 'Jane',
                    lastName: 'Doh',
                    address: 1
                }
            };
            var actual;
            var res = {
                ok: function (obj) {
                    actual = obj;
                },
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = {
                message: 'Account updated',
                accountType: 'Manager',
                account: {
                    id: 1,
                    email: 'info@beardude.com',
                    firstName: 'Jane',
                    Doe: 'Doh',
                    address: {
                        id: 1,
                        street: '123'
                    }
                }
            };
            var mockData = {
                id: 1,
                email: 'info@beardude.com',
                firstName: 'Jack',
                Doe: 'Doe'
            };
            var mockData1 = [{
                id: 1,
                email: 'info@beardude.com',
                firstName: 'Jane',
                Doe: 'Doh'
            }];
            var mockDataAddr = [{
                id: 1,
                street: '123'
            }];

            sailsMock.mockModel(Address, 'update', mockDataAddr);
            sailsMock.mockModel(Manager, 'findOne', mockData);
            sailsMock.mockModel(Manager, 'update', mockData1);

            accountService.update(req, res, 'Manager');
            Manager.findOne.restore();

            setTimeout(function () {
                expect(actual).to.deep.equal(expected);
                Manager.update.restore();
                Address.update.restore();
                done();
            }, 10);
        });
    });

    describe('updatePassword()', function () {
        it('Should return error if no password entered', function (done) {
            var actual;
            var req = {
                body: {
                    id: 1,
                    oldPassword: '123abc',
                    password: '',
                    confirmPassword: ''
                },
                session: {
                    managerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Empty password';

            accountService.updatePassword(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('Should return error if password mismatch', function (done) {
            var actual;
            var req = {
                body: {
                    id: 1,
                    oldPassword: '123abc',
                    password: '123abcd',
                    confirmPassword: '123abcdef'
                },
                session: {
                    managerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Password and confirm-password mismatch';

            accountService.updatePassword(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('Should return error if password unchanged', function (done) {
            var actual;
            var req = {
                body: {
                    id: 1,
                    oldPassword: '123abc',
                    password: '123abc',
                    confirmPassword: '123abc'
                },
                session: {
                    managerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                }
            };
            var expected = 'Password unchanged';

            accountService.updatePassword(req, res, 'Manager');
            expect(actual).to.equal(expected);
            done();
        });
        it('Should update password', function (done) {
            var actual;
            var req = {
                body: {
                    id: 1,
                    oldPassword: '123abc',
                    password: '123abcd',
                    confirmPassword: '123abcd'
                },
                session: {
                    managerInfo: {
                        id: 1,
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                badRequest: function (msg) {
                    actual = msg;
                },
                ok: function (msg) {
                    actual = msg;
                }
            };
            var mockData;
            var expected = {
                message: 'Password updated'
            };

            return bcrypt.hash('123abc', null, null, function (err, hash) {
                if (err) {
                    expect(true).to.equal(false);
                    return done();
                }
                mockData = {
                    email: 'info@beardude.com',
                    password: hash
                };
                sailsMock.mockModel(Manager, 'findOne', mockData);
                sailsMock.mockModel(Manager, 'update');
                accountService.updatePassword(req, res, 'Manager');
                return setTimeout(function () {
                    expect(actual).to.deep.equal(expected);
                    Manager.update.restore();
                    return done();
                }, 500);
            });
        });
    });
});
