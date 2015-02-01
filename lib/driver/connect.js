/*jslint node:true, browser:true */

'use strict';

var Output = require('./output');
var promise = require('es6-promise');

/**
 * Connect to the first available MIDI output
 *
 * Will fail if no output is connected or if
 * access to MIDI driver is denied by the user.
 * (In node, access is always granted.)
 *
 * @return Promise
 */
function connect() {
    return new promise.Promise(function (resolve, reject) {
        var driver, output;
        
        navigator.requestMIDIAccess().then(function (access) {
            driver = access.outputs;

            if (driver.size) {
                driver = driver.get(0);
                output = new Output(driver.send);

                resolve(output);
            } else {
                reject(new Error('No available MIDI output'));
            }
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