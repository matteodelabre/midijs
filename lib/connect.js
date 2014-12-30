/*jshint node:true, browser:true */

'use strict';

var Output = require('./output');
var output = null;

/**
 * Try to request MIDI access, and select first
 * defined output. Will fail if no output is available or
 * if MIDI is not supported.
 *
 * @return Promise
 */
function connect() {
    return new Promise(function (resolve, reject) {
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
                reject(new Error(
                    'Aucun synthétiseur MIDI n\'est disponible. Sur ' +
                        'certains systèmes d\'exploitation, un ' +
                        'synthétiseur est disponible par défaut. Si ce ' +
                        'n\'est pas votre cas, il faudra utiliser un ' +
                        'logiciel tiers puis relancer l\'application.'
                ));
            }
        }).catch(function () {
            reject(new Error(
                'Impossible d\'obtenir un accès aux contrôleurs ' +
                    'MIDI, il est possible que votre système ne ' +
                    'supporte pas la norme MIDI ou bien que ' +
                    'vous ayez refusé l\'accès à ces périphériques.'
            ));
        });
    });
}

module.exports = connect;