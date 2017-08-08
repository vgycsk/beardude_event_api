/* eslint-disable no-magic-numbers */
/* global afterEach, accountService, beforeEach, dataService, describe, it, Racer */

var racerController = require('../../../api/controllers/RacerController.js')
var sailsMock = require('sails-mock-models')
var sinon = require('sinon')
var chai = require('chai')
var expect = chai.expect
var Q = require('q')

describe('/controllers/RacerController', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })
  describe('.activate()', function () {
    it('should call accountService.activate', function (done) {
      var req = {}
      var res = {}
      var actual

      sandbox.stub(accountService, 'activate').callsFake(function () { actual = true })
      racerController.activate(req, res)
      expect(actual).to.equal(true)
      done()
    })
  })
  describe('.getRacers()', function () {
    it('should return filtered info', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj } }
      var mock = [ { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, team: 1 } ]
      var expected = { racers: [ { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, team: 1 } ] }

      mock[0].toJSON = function () { return mock[0] }
      sailsMock.mockModel(Racer, 'find', mock)
      racerController.getRacers(req, res)
      this.timeout(100)
      setTimeout(function () {
        delete mock[0].toJSON
        expect(actual).to.deep.equal(expected)
        Racer.find.restore()
        done()
      }, 50)
    })
  })
  describe('.create()', function () {
    it('should return error if password mismatch', function (done) {
      var actual
      var req = { body: { password: '123', confirmPassword: '456' } }
      var res = { badRequest: function (obj) { actual = obj } }
      var expected = 'Password and confirm-password mismatch'

      racerController.create(req, res)
      expect(actual).to.equal(expected)
      done()
    })
    it('should call accountService and create account', function (done) {
      var actual
      var req = { body: { email: 'info@beardude.com', password: '123', confirmPassword: '123' } }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { racer: { id: 1 } }

      sandbox.stub(accountService, 'create').callsFake(function () {
        var q = Q.defer()
        var result = { id: 1 }
        result.toJSON = function () { return { id: 1 } }
        q.resolve(result)
        return q.promise
      })
      racerController.create(req, res)
      this.timeout(100)
      setTimeout(function () {
        delete actual.toJSON
        expect(actual).to.deep.equal(expected)
        done()
      }, 60)
    })
  })
  describe('.getGeneralInfo()', function () {
    it('should return filtered info', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj } }
      var mock = { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, team: { id: 1, name: 'team1' } }
      var expected = { racer: { firstName: 'John', lastName: 'Doe', isActive: true, team: { id: 1, name: 'team1' } } }

      sailsMock.mockModel(Racer, 'findOne', mock)
      racerController.getGeneralInfo(req, res)
      this.timeout(150)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Racer.findOne.restore()
        done()
      }, 50)
    })
  })
  describe('.getManagementInfo()', function () {
    it('should return complete info', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, password: '123' }
      var expected = { racer: { id: 1, firstName: 'John', lastName: 'Doe', isActive: true } }

      mock.toJSON = function () {
        var obj = mock
        delete obj.password
        return obj
      }
      sailsMock.mockModel(Racer, 'findOne', mock)
      racerController.getManagementInfo(req, res)
      this.timeout(150)
      setTimeout(function () {
        delete mock.toJSON
        expect(actual).to.deep.equal(expected)
        Racer.findOne.restore()
        done()
      }, 50)
    })
  })

  describe('.login()', function () {
    it('should return message if already logged in', function (done) {
      var actual
      var req = { session: { racerInfo: { id: 1, email: 'info@beardude.com' } } }
      var res = { badRequest: function (obj) { actual = obj } }
      var expected = 'Already logged in'

      racerController.login(req, res)
      expect(actual).to.equal(expected)
      done()
    })
    it('should return error message if password incorrect', function (done) {
      var actual
      var req = { body: { email: 'info@beardude.com', password: '1234' }, session: {} }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { email: 'info@beardude.com', password: '123' }

      sailsMock.mockModel(Racer, 'findOne', mock)
      sandbox.stub(dataService, 'authenticate').callsFake(function () { return false })
      racerController.login(req, res)
      this.timeout(100)
      return setTimeout(function () {
        expect(actual.message).to.equal('Credentials incorrect')
        Racer.findOne.restore()
        return done()
      }, 50)
    })
    it('should return logged in user and create session data', function (done) {
      var actual
      var req = { body: { email: 'info@beardude.com', password: '123' }, session: {} }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { racer: { id: 1, email: 'info@beardude.com' } }
      var mock = { id: 1, email: 'info@beardude.com', password: '123' }
      var that = this

      sandbox.stub(dataService, 'authenticate').callsFake(function () { return true })
      sailsMock.mockModel(Racer, 'findOne', mock)
      that.timeout(100)
      racerController.login(req, res)
      return setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        expect(req.session).to.deep.equal({ racerInfo: mock })
        Racer.findOne.restore()
        return done()
      }, 50)
    })
  })
  describe('.logout()', function () {
    it('should remove session data', function (done) {
      var actual
      var req = { session: { racerInfo: { id: 1, email: 'info@beardude.com' } } }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { message: 'Logged out' }

      racerController.logout(req, res)
      expect(req.session).to.deep.equal({})
      expect(actual).to.deep.equal(expected)
      done()
    })
  })

  describe('.reissuePassword()', function () {
    it('should call accountService.reissuePassword', function (done) {
      var req = {}
      var res = {}
      var actual

      sandbox.stub(accountService, 'reissuePassword').callsFake(function () { actual = true })
      racerController.reissuePassword(req, res)
      expect(actual).to.equal(true)
      done()
    })
  })
  describe('.update()', function () {
    it('should call accountService.update', function (done) {
      var req = { body: { email: 'info@beardude.com' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var actual
      var mock = { email: 'info@beardude.com' }

      mock.toJSON = function () { return mock }
      sandbox.stub(accountService, 'update').callsFake(function () { actual = true })
      sailsMock.mockModel(Racer, 'findOne', mock)
      that.timeout(150)
      racerController.update(req, res)
      return setTimeout(function () {
        expect(actual).to.deep.equal({ racer: mock })
        Racer.findOne.restore()
        return done()
      }, 90)
    })
  })
  describe('.updatePassword()', function () {
    it('should call accountService.updatePassword', function (done) {
      var req = {}
      var res = {}
      var actual

      sandbox.stub(accountService, 'updatePassword').callsFake(function () { actual = true })
      racerController.updatePassword(req, res)
      expect(actual).to.equal(true)
      done()
    })
  })
})
