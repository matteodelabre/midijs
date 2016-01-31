'use strict';

const noteRegex = /([A-G])\s*([0-9-]+|[#♯B♭]+)?\s*([0-9-]+|[#♯B♭]+)?/;
const notes = Object.freeze({
    C: 0, D: 2, E: 4, F: 5,
    G: 7, A: 9, B: 11
});

/**
 * Convert a note written in conventional english notation
 * to a MIDI note number
 *
 * @example "A3" becomes 57, "G5#" becomes 80,
 * "E" becomes 64, "B6B" becomes 94, ...
 * @param {string} note Note to convert
 * @return {number} Matching MIDI note
 */
module.exports = note => {
    if (typeof note === 'number') {
        return note;
    }

    const matches = noteRegex.exec(note.trim().toUpperCase());
    let midi = notes[matches[1]] || 0, octave, modifier;

    if (isNaN(matches[2])) {
        modifier = matches[2];
        octave = matches[3];
    } else {
        modifier = matches[3];
        octave = matches[2];
    }

    (modifier || '').split('').forEach(part => {
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
