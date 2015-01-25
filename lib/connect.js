/*jslint node:true, browser:true */

'use strict';

var Output = require('./output');
var promise = require('es6-promise');
var output = null;

/**
 * Try to request MIDI access, and select first
 * defined output. Will fail if no output is available or
 * if MIDI is not supported.
 *
 * @return Promise
 */
function connect() {
    return new promise.Promise(function (resolve, reject) {
        if (output !== null) {
            resolve(output);
            return;
        }
        
        navigator.requestMIDIAccess().then(function (access) {
            var outputs = access.outputs;

            if (outputs.size) {
                output = new Output(outputs.get(0));
                resolve(output);
            } else {
                reject(new Error('No available MIDI output'));
            }
        }).catch(function () {
            reject(new Error('MIDI access denied'));
        });
    });
}

module.exports = connect;