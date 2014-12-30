/*jshint node:true, browser:true */

'use strict';

/**
 * Note
 *
 * Represent a MIDI note
 *
 * @param {options: object} Note options
 */
function Note(options) {
    options = options || {};

    this.note = options.note || 0;
    this.channel = options.channel || 0;
    this.start = options.start || 0;
    this.length = options.length || 1;
}

module.exports = Note;