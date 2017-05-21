/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var isManagerSelf = require('../../../api/policies/isManagerSelf.js');
var sinon = require('sinon');
var assert = require('assert');

describe('policies/isManagerSelf', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return true if the user is the manager, accessing own data', function (done) {
        var req = {
            params: {
                id: '3'
            },
            session: {
                managerInfo: {
                    id: 3,
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

        isManagerSelf(req, res, callbackFunc)
        assert.equal(actual, expected);
        done();
    });

    it('should return false if the user is not the manager', function (done) {
        var req = {
            params: {
                id: '5'
            },
            session: {
                managerInfo: {
                    id: 3,
                    email: 'info@beardude.com'
                }
            }
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
        var expected = 'Unauthorized';

        isManagerSelf(req, res, callbackFunc);
        assert.equal(actual, expected);
        done();
    });
});
