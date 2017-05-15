/* global before, after */

'use strict';

var sails = require('sails');
var time30s = 30000;

before(function(done) {
    // configuration for testing purposes
    var sailsConfig = {
        hooks: {
            grunt: false
        }
    };

    // Increase the Mocha timeout so that Sails has enough time to lift.
    this.timeout(time30s);
    sails.lift(sailsConfig, function (err) {
        if (err) {
            return done(err);
        }
        return done(err, sails);
    });
});

after(function (done) {
    // here you can clear fixtures, etc.
    sails.lower(done);
});
