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
            return res.ok(result);
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
        .populate('address')
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
        .populate('address')
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
    update: function (req, res) {
        return accountService.update(req, res, 'Racer');
    },
    updatePassword: function (req, res) {
        return accountService.updatePassword(req, res, 'Racer');
    }
};
