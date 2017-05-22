/* eslint-disable no-magic-numbers */
/* global afterEach, beforeEach, describe, it, Manager */

var isRacerSelfOrTeamLeaderOrManager = require('../../../api/policies/isRacerSelfOrTeamLeaderOrManager.js');
var sinon = require('sinon');
var assert = require('assert');
var sailsMock = require('sails-mock-models');

describe('policies/isRacerSelfOrTeamLeaderOrManager', function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return true if the user is the racer, accessing own data', function (done) {
        var req = {
            params: {
                id: '3'
            },
            session: {
                racerInfo: {
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

        isRacerSelfOrTeamLeaderOrManager(req, res, callbackFunc);
        assert.equal(actual, expected);
        done();
    });

    it('should return true if the user is the team leader', function (done) {
        var req = {
            params: {
                id: '3'
            },
            session: {
                racerInfo: {
                    id: 3,
                    email: 'info@beardude.com',
                    team: {
                        id: 1,
                        leader: 3
                    }
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

        isRacerSelfOrTeamLeaderOrManager(req, res, callbackFunc);
        assert.equal(actual, expected);
        done();
    });

    it('should return true if the user is an active manager', function (done) {
        var req = {
            params: {
                id: '3'
            },
            session: {
                managerInfo: {
                    id: 3,
                    email: 'info@beardude.com',
                    isActive: true
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
        var mockData = {
            id: 3,
            email: 'info@beardude.com',
            isActive: true
        };
        var expected = 'verified';

        sailsMock.mockModel(Manager, 'findOne', mockData);
        isRacerSelfOrTeamLeaderOrManager(req, res, callbackFunc);
        this.timeout(40);
        setTimeout(function () {
            assert.equal(actual, expected);
            Manager.findOne.restore();
            done();
        }, 25);
    });


    it('should return unauthorized if the user is not an active manager', function (done) {
        var req = {
            params: {
                id: '3'
            },
            session: {
                managerInfo: {
                    id: 3,
                    email: 'info@beardude.com',
                    isActive: true
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
            actual = 'verified';
        };
        var mockData = {
            id: 3,
            email: 'info@beardude.com',
            isActive: false
        };
        var expected = 'Unauthorized';

        sailsMock.mockModel(Manager, 'findOne', mockData);
        isRacerSelfOrTeamLeaderOrManager(req, res, callbackFunc);
        this.timeout(40);
        setTimeout(function () {
            assert.equal(actual, expected);
            Manager.findOne.restore();
            done();
        }, 25);
    });

    it('should return false if the user is not the racer', function (done) {
        var req = {
            params: {
                id: '5'
            },
            session: {
                racerInfo: {
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
        var expected = 'Login required';

        isRacerSelfOrTeamLeaderOrManager(req, res, callbackFunc);
        assert.equal(actual, expected);
        done();
    });
});
