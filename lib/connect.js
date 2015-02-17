/**
 * @module midijs/lib/connect
 */

'use strict';

var Driver = require('./connect/driver').Driver;
var Input = require('./connect/input').Input;
var Output = require('./connect/output').Output;
var promise = require('es6-promise');

/**
 * Establish a connection to the MIDI driver
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

/** {@link module:midijs/lib/connect/driver~Driver} */
connect.Driver = Driver;

/** {@link module:midijs/lib/connect/input~Input} */
connect.Input = Input;

/** {@link module:midijs/lib/connect/output~Output} */
connect.Output = Output;

if (global.navigator !== undefined) {
    exports.connect = connect;
}
