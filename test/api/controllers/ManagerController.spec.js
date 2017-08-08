/* eslint-disable no-magic-numbers */
/* global afterEach, accountService, beforeEach, dataService, describe, it, Manager */

var managerController = require('../../../api/controllers/ManagerController.js')
var sailsMock = require('sails-mock-models')
var sinon = require('sinon')
var chai = require('chai')
var expect = chai.expect
var Q = require('q')

describe('/controllers/ManagerController', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })
  describe('.create()', function () {
    it('should return error if password mismatch', function (done) {
      var actual
      var req = { body: { password: '123', confirmPassword: '456' } }
      var res = { badRequest: function (obj) { actual = obj } }
      var expected = 'Password and confirm-password mismatch'

      managerController.create(req, res)
      expect(actual).to.equal(expected)
      done()
    })
    it('should call accountService and create account', function (done) {
      var actual
      var req = { body: { email: 'info@beardude.com', password: '123', confirmPassword: '123' } }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { manager: { id: 1 } }

      sandbox.stub(accountService, 'create').callsFake(function () {
        var q = Q.defer()
        q.resolve({ id: 1 })
        return q.promise
      })
      managerController.create(req, res)
      this.timeout(100)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        done()
      }, 50)
    })
  })
  describe('.getAccountInfo()', function () {
    it('should return account info when logged in', function (done) {
      var actual
      var req = { session: { managerInfo: { id: 1, email: 'info@beardude.com' } } }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { manager: { id: 1, email: 'info@beardude.com' } }

      managerController.getAccountInfo(req, res)
      expect(actual).to.deep.equal(expected)
      done()
    })
  })
  describe('.getGeneralInfo()', function () {
    it('should return filtered info', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj } }
      var mock = { id: 1, firstName: 'John', lastName: 'Doe', isActive: true }
      var expected = { manager: { firstName: 'John', lastName: 'Doe', isActive: true } }

      sailsMock.mockModel(Manager, 'findOne', mock)
      managerController.getGeneralInfo(req, res)
      this.timeout(150)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Manager.findOne.restore()
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
      var expected = { manager: { id: 1, firstName: 'John', lastName: 'Doe', isActive: true } }

      mock.toJSON = function () {
        var obj = mock
        delete obj.password
        delete obj.createdAt
        return obj
      }
      sailsMock.mockModel(Manager, 'findOne', mock)
      managerController.getManagementInfo(req, res)
      this.timeout(150)
      setTimeout(function () {
        delete mock.toJSON
        expect(actual).to.deep.equal(expected)
        Manager.findOne.restore()
        done()
      }, 50)
    })
  })

  describe('.login()', function () {
    it('should return error message if password incorrect', function (done) {
      var actual
      var req = { body: { email: 'info@beardude.com', password: '1234' }, session: {} }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { email: 'info@beardude.com', paddword: '2345' }
      var that = this

      sandbox.stub(dataService, 'authenticate').callsFake(function () { return false })
      sailsMock.mockModel(Manager, 'findOne', mock)
      that.timeout(100)
      managerController.login(req, res)
      return setTimeout(function () {
        expect(actual.message).to.equal('Credentials incorrect')
        Manager.findOne.restore()
        return done()
      }, 50)
    })
    it('should return logged in user and create session data', function (done) {
      var actual
      var req = { body: { email: 'info@beardude.com', password: '123' }, session: {} }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { manager: { id: 1, email: 'info@beardude.com' } }
      var mock
      var that = this

      sandbox.stub(dataService, 'authenticate').callsFake(function () { return true })
      mock = { id: 1, email: 'info@beardude.com', password: '123' }
      sailsMock.mockModel(Manager, 'findOne', mock)
      that.timeout(100)
      managerController.login(req, res)
      return setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        expect(req.session).to.deep.equal({ managerInfo: mock })
        Manager.findOne.restore()
        return done()
      }, 50)
    })
  })
  describe('.logout()', function () {
    it('should remove session data', function (done) {
      var actual
      var req = { session: { managerInfo: { id: 1, email: 'info@beardude.com' } } }
      var res = { ok: function (obj) { actual = obj } }
      var expected = { message: 'Logged out' }

      managerController.logout(req, res)
      expect(req.session).to.deep.equal({})
      expect(actual).to.deep.equal(expected)
      done()
    })
  })
  describe('.update()', function () {
    it('should update specified fields', function (done) {
      var actual
      var req = { body: { id: 1, name: 'Manager1' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mockDataUpdate = [{ id: 1, name: 'Manager1' }]
      var expected = { manager: mockDataUpdate[0] }

      mockDataUpdate[0].toJSON = function () { return mockDataUpdate[0] }
      this.timeout(99)
      sailsMock.mockModel(Manager, 'update', mockDataUpdate)
      managerController.update(req, res)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Manager.update.restore()
        done()
      }, 30)
    })
  })
  describe('.updatePassword()', function () {
    it('should call accountService.updatePassword', function (done) {
      var req = {}
      var res = {}
      var actual

      sandbox.stub(accountService, 'updatePassword').callsFake(function () { actual = true })
      managerController.updatePassword(req, res)
      expect(actual).to.equal(true)
      done()
    })
  })
})
