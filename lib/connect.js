/*jslint node:true, browser:true */

'use strict';

var Driver = require('./connect/driver').Driver;
var promise = require('es6-promise');

/**
 * Establish connection to MIDI driver
 *
 * Will fail if access to MIDI driver is denied by the user.
 *
 * @return Promise
 */
function connect() {
    return new promise.Promise(function (resolve, reject) {
        navigator.requestMIDIAccess().then(function (access) {
            resolve(new Driver(access));
        }).catch(function () {
            reject(new Error('MIDI access denied'));
        });
    });
}

if (global.navigator === undefined) {
    module.exports = undefined;
} else {
    module.exports = connect;
}