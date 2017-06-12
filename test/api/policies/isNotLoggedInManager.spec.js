/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it */

var isNotLoggedInManager = require('../../../api/policies/isNotLoggedInManager.js');
var sinon = require('sinon');
var assert = require('assert');

describe('policies/isNotLoggedInManager', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return true if the manager is not logged in', function (done) {
        var req = {
            session: {}
        };
        var res = {};
        var expected = 'verified';
        var actual;
        var callbackFunc = function () {
            actual = 'verified';
        };

        isNotLoggedInManager(req, res, callbackFunc);
        assert.equal(actual, expected);
        done();
    });

    it('should return Already logged in if logged in as manager', function (done) {
        var req = {
            session: {
                managerInfo: {
                    email: 'info@beardude.com',
                    isActive: true
                }
            }
        };
        var actual;
        var callbackFunc = function () {
            return 'verified';
        };
        var res = {
            badRequest: function (str) {
                actual = str;
            }
        };
        var expected = 'Already logged in';

        isNotLoggedInManager(req, res, callbackFunc);
        assert.equal(actual, expected);
        done();
    });
});
