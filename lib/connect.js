/**
 * @module midijs/lib/connect
 */

'use strict';

var Driver = require('./connect/driver').Driver;
var Input = require('./connect/input').Input;
var Output = require('./connect/output').Output;
var promise = require('es6-promise');

/**
 * Establish connection to MIDI driver
 *
 * Will fail if access to MIDI driver is denied by the user.
 *
 * @return {Promise} A connection promise
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

connect.Driver = Driver;
connect.Input = Input;
connect.Output = Output;

if (global.navigator !== undefined) {
    exports.connect = connect;
}
