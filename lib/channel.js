/*jshint node:true, browser:true */

'use strict';

/**
 * Channel
 *
 * Represent a MIDI channel
 *
 * @param {id: int} Channel ID
 */
function Channel(id) {
    this.id = id;
    this.meta = {};
    this.program = 0;
    this.sound = true;
    this.notes = true;
    this.pending = {};
}

module.exports = Channel;