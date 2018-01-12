/* eslint-disable no-magic-numbers, no-undefined, max-lines */
/* global afterEach, beforeEach, describe, Group, it, Registration */

var registrationController = require('../../../api/controllers/RegistrationController.js')
var sailsMock = require('sails-mock-models')
var sinon = require('sinon')
var chai = require('chai')
var expect = chai.expect

describe('/controllers/RegistrationController', function () {
  var sandbox

  beforeEach(function () { sandbox = sinon.sandbox.create() })
  afterEach(function () { sandbox.restore() })
  describe('.create()', function () {
    it('should return registration exist if already registered', function (done) {
      var actual
      var req = { body: { group: 1, event: 1, racer: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var expected = 'Already registered'
      var mock = { id: 1, group: 1 }
      var mockGroup = { id: 1, event: 1 }

      sailsMock.mockModel(Group, 'findOne', mockGroup)
      sailsMock.mockModel(Registration, 'findOne', mock)
      registrationController.create(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual.message).to.equal(expected)
        Group.findOne.restore()
        Registration.findOne.restore()
        done()
      }, 50)
    })
  })
  describe('.update()', function () {
    it('should update registration', function (done) {
      var actual
      var req = { body: { id: 1, name: 'newName' } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = [ { id: 1, name: 'newName' } ]

      sailsMock.mockModel(Registration, 'update', mock)
      registrationController.update(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal({ registration: mock[0] })
        Registration.update.restore()
        done()
      }, 50)
    })
  })
  describe('.delete()', function () {
    it('should delete a reg', function (done) {
      var actual
      var req = { params: { id: 1 } }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, name: 'newName' }

      sailsMock.mockModel(Registration, 'findOne', mock)
      sailsMock.mockModel(Registration, 'destroy', { registration: { id: 1 } })
      registrationController.delete(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal({ registration: { id: 1 } })
        Registration.findOne.restore()
        Registration.destroy.restore()
        done()
      }, 50)
    })
  })
})
/*
  describe('.createReg()', function () {
    it('should create registration', function (done) {
      var actual
      var input = { group: 1, event: 1, racer: 1 }
      var res = { ok: function (obj) { actual = obj }, badRequest: function (obj) { actual = obj } }
      var mock = { id: 1, event: 1, group: 1 }
      var mockCreate = { id: 1, raceNumber: 3 }
      var qq = Q
      sandbox.stub(dataService, 'returnAccessCode').callsFake(function () {
        var q = qq.defer()
        q.resolve('1234')
        return q.promise
      })
      sandbox.stub(Q, 'defer').callsFake(function () { return { resolve: function (obj) { actual = obj } } })
      mockCreate.toJSON = function () { return mockCreate }
      sailsMock.mockModel(Registration, 'findOne', mock)
      sailsMock.mockModel(Registration, 'create', mockCreate)
      sailsMock.mockModel(Registration, 'count', 2)
      registrationController.createReg(input)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Registration.findOne.restore()
        Registration.create.restore()
        Registration.count.restore()
        done()
      }, 50)
    })
  })
  describe('.getInfo()', function () {
    it('should return registration info with racer id', function (done) {
      var actual
      var req = { body: { event: 1, racer: 1 } }
      var mock = {
        races: [ { id: 1 }, { id: 2 } ],
        event: 1,
        group: 1,
        accessCode: 'abcd',
        raceNumber: 1,
        paid: false,
        rfidRecycled: false,
        refundRequested: false,
        refunded: false
      }
      var expected = {
        races: [ { id: 1 }, { id: 2 } ],
        group: 1,
        accessCode: 'abcd',
        raceNumber: 1,
        paid: false,
        rfidRecycled: false,
        refundRequested: false,
        refunded: false
      }
      var res = { ok: function (obj) { actual = obj } }

      sailsMock.mockModel(Registration, 'findOne', mock)
      registrationController.getInfo(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Registration.findOne.restore()
        done()
      }, 50)
    })
    it('should return registration info with access code', function (done) {
      var actual
      var mock = {
        races: [ { id: 1 }, { id: 2 } ],
        event: 1,
        group: 1,
        accessCode: 'abcd',
        raceNumber: 1,
        paid: false,
        rfidRecycled: false,
        refundRequested: false,
        refunded: false
      }
      var expected = {
        races: [ { id: 1 }, { id: 2 } ],
        group: 1,
        accessCode: 'abcd',
        raceNumber: 1,
        paid: false,
        rfidRecycled: false,
        refundRequested: false,
        refunded: false
      }
      var res = { ok: function (obj) { actual = obj } }
      var req = { body: { event: 1, accessCode: 'abcd' } }

      sailsMock.mockModel(Registration, 'findOne', mock)
      registrationController.getInfo(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Registration.findOne.restore()
        done()
      }, 50)
    })
  })
  describe('.signupAndCreate()', function () {
    it('should create a racer account and register for an event', function (done) {
      var actual
      var req = {
        body: {
          group: 1,
          event: 1,
          racer: {
            email: 'info@beardude.com',
            firstName: 'Jane'
          }
        }
      }
      var res = {
        ok: function (obj) {
          actual = obj
        }
      }
      var expected = {
        message: 'Registered successfully',
        group: 1,
        racer: {
          id: 1,
          email: 'info@beardude.com',
          firstName: 'Jane'
        },
        accessCode: undefined
      }
      var mock = {
        id: 1,
        event: 1,
        group: 1
      }

      sandbox.stub(accountService, 'create').callsFake(function () {
        var q = Q.defer()

        q.resolve({
          id: 1,
          email: 'info@beardude.com',
          firstName: 'Jane'
        })
        return q.promise
      })
      sandbox.stub(dataService, 'returnAccessCode').callsFake(function () {
        var q = Q.defer()

        q.resolve('')
        return q.promise
      })
      sailsMock.mockModel(Registration, 'create', mock)
      registrationController.signupAndCreate(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Registration.create.restore()
        done()
      }, 50)
    })
  })
  describe('.signupAndCreateMultiple()', function () {
    it('should create a team and multiple racer accounts, then register all for an event', function (done) {
      var actual
      var req = {
        body: {
          group: 1,
          event: 1,
          team: {
            name: 'Team Murica',
            desc: 'The best of the best of the best',
            url: 'http://team-murica.cafe'
          },
          racers: [
            {
              email: 'info@beardude.com',
              firstName: 'Jane'
            },
            {
              email: 'info@beardude.com',
              firstName: 'John'
            },
            {
              email: 'info@beardude.com',
              firstName: 'Peter'
            }
          ]
        }
      }
      var racerObjs = [
        {
          id: 1,
          email: 'info@beardude.com',
          firstName: 'Jane'
        },
        {
          id: 2,
          email: 'info@beardude.com',
          firstName: 'John'
        },
        {
          id: 3,
          email: 'info@beardude.com',
          firstName: 'Peter'
        }
      ]
      var regObjs = [
        {
          event: 1,
          group: 1,
          racer: 1
        },
        {
          event: 1,
          group: 1,
          racer: 2
        },
        {
          event: 1,
          group: 1,
          racer: 3
        }
      ]
      var res = {
        ok: function (obj) {
          actual = obj
        }
      }
      var expected = {
        message: 'Team registered successfully',
        team: {
          id: 1,
          name: 'Team Murica',
          desc: 'The best of the best of the best',
          url: 'http://team-murica.cafe',
          leader: 1
        },
        registrations: regObjs
      }
      var mock = {
        id: 1,
        name: 'Team Murica',
        desc: 'The best of the best of the best',
        url: 'http://team-murica.cafe'
      }
      var mockUpdate = [{
        id: 1,
        name: 'Team Murica',
        desc: 'The best of the best of the best',
        url: 'http://team-murica.cafe',
        leader: 1
      }]
      var mockReg = {
        id: 1,
        event: 1,
        group: 1
      }
      var accountId = 1
      var stubb = sandbox.stub(Q, 'all')

      sandbox.stub(accountService, 'create').callsFake(function (query) {
        var q = Q.defer()
        var result = query

        result.id = accountId
        accountId += 1
        q.resolve(result)
        return q.promise
      })
      stubb.onFirstCall().returns(racerObjs)
      stubb.onSecondCall().returns(regObjs)
      sailsMock.mockModel(Team, 'create', mock)
      sailsMock.mockModel(Team, 'update', mockUpdate)
      sailsMock.mockModel(Registration, 'create', mockReg)
      registrationController.signupAndCreateMultiple(req, res)
      this.timeout(99)
      setTimeout(function () {
        expect(actual).to.deep.equal(expected)
        Team.create.restore()
        Team.update.restore()
        Registration.create.restore()
        done()
      }, 70)
    })
  })
  describe('.updatePayment()', function () {
      it('should ', function (done) {
      });
  });
  describe('.requestRefund()', function () {
      it('should ', function (done) {
      });
  });
  describe('.refunded()', function () {
      it('should ', function (done) {
      });
  });
*/
