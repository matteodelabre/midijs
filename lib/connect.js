/*jslint node:true, browser:true */

'use strict';

var Output = require('./output');
var promise = require('es6-promise');

var isNode = (global.navigator === undefined);

if (isNode) {
    var midi = require('midi');
}

/**
 * Try to request MIDI access, and select first
 * defined output. Will fail if no output is available or
 * if MIDI is not supported.
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
                
                output = new Output(function () {
                    driver.sendMessage.apply(
                        driver,
                        [].slice.call(arguments)
                    );
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
                    
                    output = new Output(function () {
                        driver.send.apply(
                            driver,
                            [].slice.call(arguments)
                        );
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