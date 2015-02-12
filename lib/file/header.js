'use strict';

/**
 * Header
 *
 * Represent an Standard MIDI file Header
 *
 * @constructor
 * @param {Number} fileType - MIDI file type (0, 1, 2)
 * @param {Number} trackCount - Amount of tracks in the file
 * @param {Number} ticksPerBeat - Beats rate in ticks per beat
 */
function Header(fileType, trackCount, ticksPerBeat) {
    this.fileType = fileType || 1;
    this.trackCount = trackCount || 0;
    this.ticksPerBeat = ticksPerBeat || 120;
}

exports.Header = Header;
