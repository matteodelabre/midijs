/*jslint node:true, browser:true */

'use strict';

var Output = require('./output');
var promise = require('es6-promise');

var isNode = (global.navigator === undefined);

if (isNode) {
    var midi = require('midi');
}

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
        
        if (isNode) {
            driver = new (midi.output)();
            
            if (driver.getPortCount()) {
                driver.openPort(0);
                
                output = new Output(function (data, delay) {
                    setTimeout(function () {
                        driver.sendMessage(data);
                    }, delay);
                });
                
                resolve(output);
            } else {
                reject(new Error('No available MIDI output'));
            }
        } else {
            navigator.requestMIDIAccess().then(function (access) {
                driver = access.outputs;

                if (driver.size) {
                    driver = driver.get(0);
                    
                    output = new Output(function (data, delay) {
                        driver.send(data, delay);
                    });
                    
                    resolve(output);
                } else {
                    reject(new Error('No available MIDI output'));
                }
            }).catch(function () {
                reject(new Error('MIDI access denied'));
            });
        }
    });
}

module.exports = connect;