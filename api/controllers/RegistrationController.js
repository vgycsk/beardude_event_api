/* global dataService, Group, Registration */

'use strict'

var Q = require('q')
var RegistrationController = {
  // {event: ID, group: ID, racer: ID, name: STR}
  // indieEvent 直接讀 name, 不用racer model
  createReg: function (input) {
    var q = Q.defer()
    var obj = input

    dataService.returnAccessCode(obj.event)
    .then(function (accessCode) {
      obj.accessCode = accessCode
      if (!input.raceNumber) {
        return Registration.count({group: input.group})
      }
      return false
    })
    .then(function (V) {
      if (V) {
        obj.raceNumber = V + 1
      }
      return Registration.create(obj)
    })
    .then(function (V) {
      var result = V.toJSON()
      result.races = []
      return q.resolve(result)
    })
    .catch(function (E) { return q.reject(E) })
    return q.promise
  },
  // {group: ID, name: STR, racer: ID}
  create: function (req, res) {
    var input = req.body
    var query = (input.racer) ? {group: input.group, racer: input.racer} : {group: input.group, name: input.name}

    Group.findOne({ id: input.group })
    .then(function (V) {
      input.event = V.event
      return Registration.findOne(query)
    })
    .then(function (modelData) {
      if (modelData) { throw new Error('Already registered') }
      return RegistrationController.createReg(input)
    })
    .then(function (modelData) { return res.ok({ registration: modelData }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {(racer: ID || accessCode: STR || raceNumber: INT)}
  getInfo: function (req, res) {
    var input = req.body

    Registration.findOne(input).populate('races')
    .then(function (modelData) {
      return res.ok({ races: modelData.races, group: modelData.group, accessCode: modelData.accessCode, raceNumber: modelData.raceNumber, paid: modelData.paid, rfidRecycled: modelData.rfidRecycled, refundRequested: modelData.refundRequested, refunded: modelData.refunded })
    })
    .catch(function (E) { return res.badRequest(E) })
  },
  // {id: ID, name: STR}
  update: function (req, res) {
    var input = req.body
    var fields = ['name', 'epc', 'raceNumber']
    var updateObj = dataService.returnUpdateObj(fields, input)

    Registration.update({ id: input.id }, updateObj)
    .then(function (V) { return res.ok({ registration: V[0] }) })
    .catch(function (E) { return res.badRequest(E) })
  },
  // /:id
  delete: function (req, res) {
    var query = {id: parseInt(req.params.id)}

    Registration.findOne(query).populate('races')
    .then(function (V) {
      if (V.raceNotes) { throw new Error('Cannot delete racer that has raceNotes') }
      return Registration.destroy(query)
    })
    .then(function (V) { return res.ok({ registration: query }) })
    .catch(function (E) { return res.badRequest(E) })
  },
/*
  // {id: ID, race: ID, note: STR, isDisqualified: BOOL}
  updateDisqualification: function (req, res) {
    var input = req.body

    Registration.findOne({ id: input.id })
    .then(function (regData) {
      var raceNotes = dataService.returnUpdatedRaceNotes(input.race, input.note, regData.raceNotes)

      return Registration.update({ id: input.id }, { isDisqualified: input.isDisqualified, raceNotes: raceNotes })
    })
    .then(function (V) { return res.ok({ registration: V[0] }) })
    .catch(function (E) { return res.badRequest(E) })
  },
*/
  // {id: ID, race: ID, note: STR}
  updateRaceNote: function (req, res) {
    var input = req.body

    Registration.findOne({ id: input.id })
    .then(function (regData) {
      var raceNotes = dataService.returnUpdatedRaceNotes(input.race, input.note, regData.raceNotes)

      return Registration.update({ id: input.id }, { raceNotes: raceNotes })
    })
    .then(function (V) { return res.ok({ registration: V[0] }) })
    .catch(function (E) { return res.badRequest(E) })
  }
}

module.exports = RegistrationController

/*
  // {event: ID, group: ID, racer: {email: STR, password: STR, confirmPassword: STR, ...} }
  signupAndCreate: function (req, res) {
    var input = req.body
    var racerObj

    accountService.create(req.body.racer)
      .then(function (result) {
        racerObj = result
        input.racer = racerObj.id
        return RegistrationController.createReg(input)
      })
      .then(function (modelData) {
        return res.ok({ message: 'Registered successfully', group: input.group, racer: racerObj, accessCode: modelData.accessCode })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
  // 情境1: 隊伍跟選手都是新的 -> 1) 輸入隊伍及選手資料 2) 報名
  // 情境2: 已註冊帳號想團報-> 1) 登入 2) 註冊車隊 3) 註冊或選擇選手 4) 報名
  // 這個是情境1用的
  // {event: ID, group: ID, team: {name: STR, desc: STR, url: STR}, racers: [{email: STR, ...}]}
  signupAndCreateTeam: function (req, res) {
    var input = req.body
    var teamObj
    var racersObj
    var regsObj

    // 1. create team
    Team.create(input.team)
      .then(function (teamData) {
        var funcs = input.racers.map(function (racer) {
          var query = racer

          query.team = teamData.id
          return accountService.create(query)
        })
        teamObj = teamData
        // 2. create racers
        return Q.all(funcs)
      })
      .then(function (racersData) {
        var funcs = racersData.map(function (racer) {
          return RegistrationController.createReg({ event: input.event, group: input.group, racer: racer.id })
        })

        racersObj = racersData
        // 3. create regs
        return Q.all(funcs)
      })
      .then(function (regs) {
        regsObj = regs
        return Team.update({ id: teamObj.id }, { leader: racersObj[0].id })
      })
      .then(function (teamData) {
        teamObj = teamData[0]
        return res.ok({ message: 'Team registered successfully', team: teamObj, registrations: regsObj })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
    // {registration: ID, paid: BOOL}
    updatePayment: function (req, res) {
        var input = req.body;
        var query = {
            registration: parseInt(input.registration)
        };
        var updateObj = {
            paid: false
        };

        if (input.paid && input.paid !== '') {
            updateObj.paid = true;
        }
        Registration.findOne(query)
        .then(function (modelData) {
            if (modelData.paid === updateObj.paid) {
                throw new Error('Payment status unchange');
            }
            return Registration.update(query, updateObj);
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Payment status changed',
                registration: modelData[0].id
            });
        });
    },
    // {registration: ID, refundRequested: BOOL}
    requestRefund: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.registration)
        };
        var updateObj = {};

        if (input.refundRequested && input.refundRequested !== '') {
            updateObj.refundRequested = true;
        } else {
            updateObj.refundRequested = false;
        }
        Registration.findOne(query)
        .then(function (modelData) {
            if (!modelData.paid) {
                throw new Error('Registration unpaid');
            }
            return Registration.update(query, updateObj);
        })
        .then(function () {
            return res.ok({
                message: 'Refund requested',
                registration: input.registration
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {registration: ID, refunded: BOOL}
    refunded: function (req, res) {
        var input = req.body;
        var query = {
            id: parseInt(input.registration)
        };
        var updateObj = {};

        if (input.refunded && input.refunded !== '') {
            updateObj.refunded = true;
        } else {
            updateObj.refunded = false;
        }
        Registration.findOne(query)
        .then(function (modelData) {
            if (modelData.paid && (modelData.refunded !== updateObj.refunded)) {
                return Registration.update(query, updateObj);
            }
            throw new Error('Registration unpaid or refunded status unchanged');
        })
        .then(function () {
            return res.ok({
                message: 'Marked as refunded',
                registration: input.registration
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    */
    // {registration: ID}
/*
  confirmRegistration: function (req, res) {
    var regId = parseInt(req.body.registration)
    var raceNumber
    var eventId

    Registration.findOne({ id: regId })
      .populate('event')
      .then(function (modelData) {
        eventId = modelData.event.id
        raceNumber = modelData.event.assignedRaceNumber
        return Event.update({ id: eventId }, { assignedRaceNumber: raceNumber + 1 })
      })
      .then(function () {
        return Registration.findOne({ event: eventId, raceNumber: raceNumber })
      })
      .then(function (modelData) {
        if (modelData) {
          throw new Error('Race number already assigned')
        }
        Registration.update({ registration: regId }, { raceNumber: raceNumber })
      })
      .then(function () {
        return res.ok({ message: 'Registration confirmed', raceNumber: raceNumber })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },

  // {race: ID, epc: STR}
  admitRacer: function (req, res) {
    var input = req.body

    input.race = parseInt(input.race)
    // validate racer in selected race
    Registration.findOne({ epc: input.epc })
      .populate('races')
      .then(function (regData) {
        var raceObj

        regData.races.forEach(function (race) {
          if (race.id === input.race) {
            raceObj = race
          }
        })
        if (!raceObj) {
          throw new Error('Racer not in this race')
        }
        raceObj.recordsHashTable[input.epc] = []
        return Race.update({ id: raceObj.id }, { recordsHashTable: raceObj.recordsHashTable })
      })
      .then(function () {
        return res.ok({ message: 'Racer admitted', epc: input.epc })
      })
      .catch(function (E) {
        return res.badRequest(E)
      })
  },
*/
