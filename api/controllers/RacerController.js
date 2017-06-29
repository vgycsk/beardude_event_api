/* global accountService, dataService, Racer */

'use strict';

module.exports = {
    // {email: STR}
    racerExist: function (req, res) {
        var input = req.body;

        Racer.findOne(input)
        .then(function (result) {
            var msg = false;

            if (result) {
                msg = true;
            }
            return res.ok({
                racer: input.email,
                exist: msg
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    activate: function (req, res) {
        return accountService.activate(req, res, 'Racer');
    },
    getRacers: function (req, res) {
      Racer.find({})
      .then(function (modelData) {
          var result = modelData.map(function (racer) {
              var temp = racer;

              delete temp.password;
              return temp;
          });
          return res.ok({
              racers: result
          });
      })
      .catch(function (E) {
          return res.badRequest(E);
      });
    },

    create: function (req, res) {
        var input = req.body;

        if (input.password !== input.confirmPassword) {
            throw new Error('Password and confirm-password mismatch');
        }
        accountService.create(input, 'Racer')
        .then(function (result) {
            var modResult = result;

            delete modResult.password;
            return res.ok({
              racer: modResult
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },

    // Get insensitive account info
    getGeneralInfo: function (req, res) {
        Racer.findOne({
            id: req.params.id
        })
        .populate('team')
        .then(function (modelData) {
            return res.ok({
                racer: {
                    firstName: modelData.firstName,
                    lastName: modelData.lastName,
                    isActive: modelData.isActive
                }
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    // Get complete account info
    getManagementInfo: function (req, res) {
        Racer.findOne({
            id: req.params.id
        })
        .populate('registrations')
        .populate('team')
        .then(function (modelData) {
            var result = modelData;

            delete result.password;
            return res.ok({
              racer: result
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    login: function (req, res) {
        var input = req.body;
        var modelDataObj;

        if (req.session.racerInfo) {
            return res.badRequest('Already logged in');
        }
        return Racer.findOne({
            email: input.email
        })
        .populate('team')
        .then(function (modelData) {
            modelDataObj = modelData;
            return dataService.authenticate(input.password, modelDataObj.password);
        })
        .then(function (authenticated) {
            if (!authenticated) {
                throw new Error('Credentials incorrect');
            }
            delete modelDataObj.password
            req.session.racerInfo = modelDataObj;
            return res.ok({
              racer: modelDataObj
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    logout: function (req, res) {
        delete req.session.racerInfo;
        return res.ok({
            message: 'Logged out'
        });
    },
    reissuePassword: function (req, res) {
        return accountService.reissuePassword(req, res, 'Racer');
    },
    // Update fields speficied in returnUpdateFields function
    update: function (req, res, modelName) {
        var input = req.body;
        var resultObj;
        var fields = ['email', 'phone', 'firstName', 'lastName', 'nickName', 'birthday', 'idNumber', 'password', 'street', 'district', 'city', 'county', 'country', 'zip', 'isActive'];

        Racer.findOne({
            id: parseInt(input.id)
        })
        .then(function (modelData) {
            var updateObj = {};
            var toUpdate;

            if (input.password && input.password !== input.confirmPassword) {
                return res.badRequest('Password and confirm-password mismatch');
            }
            fields.forEach(function (field) {
              if (typeof input[field] !== 'undefined') {
                  updateObj[field] = input[field];
                  toUpdate = true;
              }
            });
            if (toUpdate) {
                return Racer.update({
                    id: input.id
                }, updateObj);
            }
            return false;
        })
        .then(function (modelData) {
            return Racer.findOne({
                id: input.id
            })
            .populate('registrations')
            .populate('team');
        })
        .then(function (modelData) {
            var result = modelData;

            delete result.password;
            return res.ok({
              racer: result
            });
        })
        .catch(function (E) {
            return res.badRequest(E);
        });
    },
    updatePassword: function (req, res) {
        return accountService.updatePassword(req, res, 'Racer');
    }
};
