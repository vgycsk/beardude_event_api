
'use strict';

var React = require('react');

module.exports = {
    get: function (url, callback) {
        fetch(url)
        .then(function (result) {
            console.log('result: ', result);
            return result.text();
        })
        .then(function (bodyRaw) {
            console.log('bodyRaw: ', bodyRaw);
            var body = JSON.parse(bodyRaw);

            callback(body);
        });
    },
    post: function (url, obj, callback) {
        var fetchObject = {
            method: 'post',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        };

        fetch(url, fetchObject)
        .then(function (result) {
            return result.text();
        })
        .then(function (bodyRaw) {
            var body = JSON.parse(bodyRaw);

            callback(body);
        });
    },
    upload: function (url, obj, callback) {
        var data = new FormData();
        var i;
        var fetchObject = {
            method: 'post',
            credentials: 'same-origin'
        };

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                data.append(i, obj[i]);
            }
        }
        obj.files.forEach(function (file) {
            data.append('file', file);
        });
        fetchObject.body = data;
        fetch(url, fetchObject)
        .then(function (result) {
            return result.text();
        })
        .then(function (bodyRaw) {
            var body = JSON.parse(bodyRaw);

            callback(body);
        });
    }
};
