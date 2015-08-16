'use strict';

var matcher = /([A-G])\s*([0-9]+|[#♯B♭]+)?\s*([0-9]+|[#♯B♭]+)?/;
var notes = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
};

/**
 * Use given key to find a constant in given enum
 * The key will be normalized to capital alphanumeric characters
 * and underscores
 *
 * @example "this is, a constant" becomes "THIS_IS_A_CONSTANT"
 * @param {Object} enum List of values
 * @param {string} key Constant key
 * @return {*} Matching key, or underfined
 */
module.exports = function convertNote(note) {
    var matches, midi, octave, modifier;

    matches = matcher.exec(note.trim().toUpperCase());
    midi = notes[matches[1]] || 0;

    console.log(matches);
    console.log('base = %d', midi);

    if (isNaN(matches[2])) {
        modifier = matches[2];
        octave = matches[3];
    } else {
        modifier = matches[3];
        octave = matches[2];
    }

    (modifier || '').split('').forEach(function (part) {
        console.log('modifier = %s', part);
        if (part === '#' || part === '♯') {
            midi += 1;
        } else {
            midi -= 1;
        }
    });

    octave = (isNaN(octave)) ? 4 : parseInt(octave, 10);
    console.log('octave = %d', octave);
    midi += 12 * (octave + 1);

    return midi;
};
