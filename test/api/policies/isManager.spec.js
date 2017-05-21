/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var isManager = require('../../../api/policies/isManager.js');
var sinon = require('sinon');
var assert = require('assert');

describe('policies/isActiveManager', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('', function () {
        it('should return true if the user is a manager', function (done) {
            var req = {
                session: {
                    managerInfo: {
                        email: 'info@beardude.com'
                    }
                }
            };
            var res = {
                forbidden: function (str) {
                    return str;
                }
            };
            var actual;
            var callbackFunc = function () {
                actual = 'verified';
            };
            var expected = 'verified';

            isManager(req, res, callbackFunc)
            assert.equal(actual, expected);
            done();
        });

        it('should return false if the user is not logged in as manager', function (done) {
            var req = {
                session: {}
            };
            var actual;
            var res = {
                forbidden: function (str) {
                    actual = str;
                }
            };
            var callbackFunc = function () {
                return 'verified';
            };
            var expected = 'Login required';

            isManager(req, res, callbackFunc);
            assert.equal(actual, expected);
            done();
        });
    });
});
