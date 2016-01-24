'use strict';

var matcher = /([A-G])\s*([0-9-]+|[#♯B♭]+)?\s*([0-9-]+|[#♯B♭]+)?/;
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
 * Convert a note written in conventional english notation
 * to a MIDI note number
 *
 * @example "A3", "G5#", "E", "B6B", ...
 * @param {string} note Note to convert
 * @return {number} Matching MIDI note
 */
module.exports = function convertNote(note) {
    var matches, midi, octave, modifier;

    if (typeof note === 'number') {
        return note;
    }

    matches = matcher.exec(note.trim().toUpperCase());
    midi = notes[matches[1]] || 0;

    if (isNaN(matches[2])) {
        modifier = matches[2];
        octave = matches[3];
    } else {
        modifier = matches[3];
        octave = matches[2];
    }

    (modifier || '').split('').forEach(function (part) {
        if (part === '#' || part === '♯') {
            midi += 1;
        } else {
            midi -= 1;
        }
    });

    octave = (isNaN(octave)) ? 4 : parseInt(octave, 10);
    midi += 12 * (octave + 1);

    return midi;
};
