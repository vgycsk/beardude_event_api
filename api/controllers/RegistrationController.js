/* global dataService, Race, Registration */

'use strict';

module.exports = {
    // {event: ID, group: ID, racer: ID}
    create: function (req, res) {
        var input = {
            group: parseInt(req.body.group),
            racer: parseInt(req.body.racer)
        };

        Registration.findOne(input)
        .then(function (modelData) {
            if (modelData) {
                throw new Error('Already registered');
            }
            return dataService.returnAccessCode();
        })
        .then(function (accessCode) {
            input.accessCode = accessCode;
            return Registration.create(input);
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
    // {event: ID}
    getInfo: function (req, res) {
        var query = {
            event: parseInt(req.body.event),
            racer: req.session.racerInfo.id
        };

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
        .then(function (modelData) {
            return res.ok({
                message: 'Rfid recycled',
                registration: modelData[0].id
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
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
