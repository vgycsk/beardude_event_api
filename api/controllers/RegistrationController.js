/* global accountService, dataService, Race, Registration, Team */

'use strict';

var Q = require('q');
var RegistrationController = {
    // {event, ID, group: ID, team: ID}
    checkIfRegistrationAllowed: function (input) {
        var q = Q.defer();
        var maxTeamRacerPerGroup;
        var teamId = input.team;
        var racersAllowed;

        Event.findOne({
            id: input.event
        })
        .then(function (eventData) {
            maxTeamRacerPerGroup = eventData.maxTeamRacerPerGroup;
            return Registration.find({
                group: input.group
            })
            .populate('racer');
        })
        .then(function (regData) {
            var registeredTeamMemberCount = 0;

            regData.racer.forEach(function (racer) {
                if (racer.team === teamId) {
                    registeredTeamMemberCount += 1;
                }
            });
            if (registeredTeamMemberCount >= maxTeamRacerPerGroup) {
                return q.resolve({
                    allowed: false,
                    message: 'Exceed max number of same-team racer registering for the same group'
                });
            }
            return Group.findOne({
                id: input.group
            });
        })
        .then(function (groupData) {
            racersAllowed = groupData.racersAllowed;

            return Registration.count({
                group: input.group
            });
        })
        .then(function (regCount) {
            if (regCount >= racersAllowed) {
                return q.resolve({
                    allowed: false,
                    message: 'Exceed max number of registeration for the group'
                });
            }
            return q.resolve({
                allowed: true
            });
        })
        .catch(function (E) {
            return q.reject(E);
        })
        return q.promise;
    },
    // {event, ID, group: ID, racer: ID}
    createReg: function (input) {
        var q = Q.defer();
        var query = input;
        var maxTeamRacerPerGroup;
        var teamId;

        RegistrationController.checkIfRegistrationAllowed(input)
        .then(function (result) {
            if (result.allowed) {
                return dataService.returnAccessCode();
            }
            throw new Error(result.message);
        })
        .then(function (accessCode) {
            query.accessCode = accessCode;
            return Registration.create(query);
        })
        .then(function (regData) {
            return q.resolve(regData);
        })
        .catch(function (E) {
            return q.reject(E);
        });
        return q.promise;
    },
    // {event: ID, group: ID, racer: {email: STR, password: STR, confirmPassword: STR, ...} }
    signupAndCreate: function (req, res) {
        var input = {
            event: parseInt(req.body.event),
            group: parseInt(req.body.group)
        };
        var racerObj;

        accountService.create(req.body.racer)
        .then(function (result) {
            racerObj = result;
            input.racer = racerObj.id;
            return RegistrationController.createReg(input);
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Registered successfully',
                group: input.group,
                racer: racerObj,
                accessCode: modelData.accessCode
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // 情境1: 隊伍跟選手都是新的 -> 1) 輸入隊伍及選手資料 2) 報名
    // 情境2: 已註冊帳號想團報-> 1) 登入 2) 註冊車隊 3) 註冊或選擇選手 4) 報名
    // 這個是情境1用的
    // {event: ID, group: ID, team: {name: STR, desc: STR, url: STR}, racers: [{email: STR, ...}]}
    signupAndCreateMultiple: function (req, res) {
        var input = req.body;
        var teamObj;
        var racersObj;
        var regsObj;

        input.event = parseInt(input.event);
        input.group = parseInt(input.group);
        // 1. create team
        Team.create(input.team)
        .then(function (teamData) {
            var funcs = [];

            teamObj = teamData;
            input.racers.forEach(function (racer) {
                var query = racer;

                query.team = teamData.id;
                funcs.push(accountService.create(query));
            });
            // 2. create racers
            return Q.all(funcs);
        })
        .then(function (racersData) {
            var funcs = [];

            racersObj = racersData;
            racersObj.forEach(function (racer) {
                var regObj = {
                    event: input.event,
                    group: input.group,
                    racer: racer.id
                };

                funcs.push(RegistrationController.createReg(regObj));
            });
            // 3. create regs
            return Q.all(funcs);
        })
        .then(function (regs) {
            regsObj = regs;
            return Team.update({
                id: teamObj.id
            }, {
                leader: racersObj[0].id
            });
        })
        .then(function (teamData) {
            teamObj = teamData[0];
            return res.ok({
                message: 'Team registered successfully',
                team: teamObj,
                registrations: regsObj
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, group: ID, racer: ID}
    create: function (req, res) {
        var input = {
            event: parseInt(req.body.event),
            group: parseInt(req.body.group),
            racer: parseInt(req.body.racer)
        };

        Registration.findOne(input)
        .then(function (modelData) {
            if (modelData) {
                throw new Error('Already registered');
            }
            return RegistrationController.createReg(input);
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Registered successfully',
                group: input.group,
                racer: input.racer,
                accessCode: modelData.accessCode
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, (racer: ID || accessCode: STR || raceNumber: INT)}
    getInfo: function (req, res) {
        var input = req.body;
        var query = {
            event: parseInt(input.event)
        };

        if (input.racer && input.racer !== '') {
            query.racer = parseInt(input.racer);
        } else if (input.accessCode && input.accessCode !== '') {
            query.accessCode = input.accessCode;
        } else if (input.raceNumber && input.raceNumber !== '') {
            query.raceNumber = parseInt(input.raceNumber);
        } else {
            throw new Error('Query incomplete');
        }
        Registration.findOne(query)
        .populate('races')
        .then(function (modelData) {
            var result = {
                races: modelData.races,
                event: modelData.event,
                group: modelData.group,
                accessCode: modelData.accessCode,
                raceNumber: modelData.raceNumber,
                paid: modelData.paid,
                rfidRecycled: modelData.rfidRecycled,
                refundRequested: modelData.refundRequested,
                refunded: modelData.refunded
            };

            return res.ok(result);
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, accessCode: STR, epc: STR}
    assignRfid: function (req, res) {
        var input = req.body;
        var regId;

        input.event = parseInt(input.event);
        Registration.findOne({
            event: input.event,
            accessCode: input.accessCode
        })
        .then(function (modelData) {
            if (modelData.epc && modelData.epc !== '') {
                throw new Error('Racer already has RFID');
            }
            regId = modelData.id;
            // Validate if rfid already assigned in this event
            return Registration.findOne({
                event: input.event,
                epc: input.epc
            });
        })
        .then(function (modelData) {
            if (modelData) {
                throw new Error('RFID already assigned to another racer');
            }
            return Registration.update({
                id: regId
            }, {
                epc: input.epc
            });
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Rfid assigned',
                raceNumber: modelData[0].raceNumber
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {event: ID, raceNumber: INT, epc: STR}
    replaceRfid: function (req, res) {
        var input = req.body;
        var regId;

        input.event = parseInt(input.event);
        input.raceNumber = parseInt(input.raceNumber);
        Registration.findOne(input)
        .then(function (modelData) {
            if (!modelData.epc || modelData.epc === '') {
                throw new Error('Racer not assigned RFID yet');
            }
            regId = modelData.id;
            // Validate if rfid already assigned in this event
            return Registration.findOne({
                event: input.event,
                epc: input.epc
            });
        })
        .then(function (modelData) {
            if (modelData) {
                throw new Error('RFID already assigned to another racer');
            }
            return Registration.update({
                id: regId
            }, {
                epc: input.epc
            });
        })
        .then(function (modelData) {
            return res.ok({
                message: 'Rfid replaced',
                raceNumber: modelData[0].raceNumber
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {epc: STR}
    recycleRfid: function (req, res) {
        var query = {
            epc: req.body.epc
        };

        Registration.update(query, {
            rfidRecycled: true
        })
        .then(function () {
            return res.ok({
                message: 'Rfid recycled',
                epc: req.body.epc
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {registration: ID, paid: BOOL}
    /*
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
    confirmRegistration: function (req, res) {
        var regId = parseInt(req.body.registration);
        var raceNumber;
        var eventId;

        Registration.findOne({
            id: regId
        })
        .populate('event')
        .then(function (modelData) {
            eventId = modelData.event.id;
            raceNumber = modelData.event.assignedRaceNumber;
            return Event.update({
                id: eventId
            }, {
                assignedRaceNumber: raceNumber + 1
            });
        })
        .then(function () {
            return Registration.findOne({
                event: eventId,
                raceNumber: raceNumber
            });
        })
        .then(function (modelData) {
            if (modelData) {
                throw new Error('Race number already assigned');
            }
            Registration.update({
                registration: regId
            }, {
                raceNumber: raceNumber
            });
        })
        .then(function () {
            return res.ok({
                message: 'Registration confirmed',
                raceNumber: raceNumber
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, epc: STR}
    admitRacer: function (req, res) {
        var input = req.body;

        input.race = parseInt(input.race);
        // validate racer in selected race
        Registration.findOne({
            epc: input.epc
        })
        .populate('races')
        .then(function (regData) {
            var raceObj;

            regData.races.forEach(function (race) {
                if (race.id === input.race) {
                    raceObj = race;
                }
            });
            if (!raceObj) {
                throw new Error('Racer not in this race');
            }
            raceObj.recordsHashTable[input.epc] = [];
            return Race.update({
                id: raceObj.id
            }, {
                recordsHashTable: raceObj.recordsHashTable
            });
        })
        .then(function () {
            return res.ok({
                message: 'Racer admitted',
                epc: input.epc
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, registration: ID, note: STR, isDisqualified: BOOL}
    updateDisqualification: function (req, res) {
        var input = req.body;

        input.race = parseInt(input.race);
        input.registration = parseInt(input.registration);
        if (input.isDisqualified && input.isDisqualified !== '') {
            input.isDisqualified = true;
        } else {
            input.isDisqualified = false;
        }
        Registration.findOne({
            id: input.registration
        })
        .then(function (regData) {
            var raceNotes = dataService.returnUpdatedRaceNotes(input.race, input.note, regData.raceNotes);

            return Registration.update({
                id: input.registration
            }, {
                isDisqualified: input.isDisqualified,
                raceNotes: raceNotes
            });
        })
        .then(function () {
            return res.ok({
                message: 'Racer disqualification updated',
                race: input.race,
                isDisqualified: input.isDisqualified,
                registration: input.registration,
                note: input.note
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // {race: ID, registration: ID, note: STR}
    updateRaceNote: function (req, res) {
        var input = req.body;

        input.race = parseInt(input.race);
        input.registration = parseInt(input.registration);
        Registration.findOne({
            id: input.registration
        })
        .then(function (regData) {
            var raceNotes = dataService.returnUpdatedRaceNotes(input.race, input.note, regData.raceNotes);

            return Registration.update({
                id: input.registration
            }, {
                raceNotes: raceNotes
            });
        })
        .then(function () {
            return res.ok({
                message: 'Race note added',
                race: input.race,
                registration: input.registration,
                note: input.note
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    }
};

module.exports = RegistrationController;
