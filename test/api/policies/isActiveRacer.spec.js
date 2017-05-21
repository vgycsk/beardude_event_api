/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Racer */

var isActiveRacer = require('../../../api/policies/isActiveRacer.js');
var sinon = require('sinon');
var assert = require('assert');
var sailsMock = require('sails-mock-models');

describe('policies/isActiveRacer', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('', function () {
        it('should return true if the user is an active racer', function (done) {
            var req = {
                session: {
                    racerInfo: {
                        email: 'info@beardude.com',
                        isActive: true
                    }
                }
            };
            var mockData = {
                id: 1,
                email: 'info@beardude.com',
                isActive: true
            };
            var callbackFunc = function () {
                return 'verified';
            };
            var res = {
                forbidden: function (str) {
                    return str;
                }
            };
            var expected;

            sailsMock.mockModel(Racer, 'findOne', mockData);
            isActiveRacer(req, res, callbackFunc)
            .then(function (actual) {
                expected = 'verified';
                assert.equal(actual, expected);
                Racer.findOne.restore();
                done();
            });
        });

        it('should return Login required if no session data found', function (done) {
            var req = {
                session: {}
            };
            var actual;
            var mockData;
            var callbackFunc = function () {
                return 'verified';
            };
            var res = {
                forbidden: function (str) {
                    actual = str;
                }
            };
            var expected = 'Login required';

            sailsMock.mockModel(Racer, 'findOne', mockData);
            isActiveRacer(req, res, callbackFunc);
            assert.equal(actual, expected);
            Racer.findOne.restore();
            done();
        });

        it('should return forbidden if racer is updated inActive', function (done) {
            var req = {
                session: {
                    racerInfo: {
                        email: 'info@beardude.com',
                        isActive: true
                    }
                }
            };
            var actual;
            var mockData = {
                email: 'info@beardude.com',
                isActive: false
            };
            var callbackFunc = function () {
                return 'verified';
            };
            var res = {
                forbidden: function (str) {
                    actual = str;
                }
            };
            var expected = 'Login required or need activation';

            sailsMock.mockModel(Racer, 'findOne', mockData);
            isActiveRacer(req, res, callbackFunc);
            setTimeout(function () {
                assert.equal(actual, expected);
                Racer.findOne.restore();
                done();
            }, 100);
        });
    });
});
