/*jslint node:true, browser:true */

'use strict';

/**
 * Header
 *
 * Represent an Standard MIDI file Header
 *
 * @param {fileType: int}       MIDI file type (0, 1, 2)
 * @param {trackCount: int}     Amount of tracks in the file
 * @param {ticksPerBeat: int}   Beats rate in ticks per beat
 */
function Header(fileType, trackCount, ticksPerBeat) {
    this.fileType = fileType || 1;
    this.trackCount = trackCount || 0;
    this.ticksPerBeat = ticksPerBeat || 120;
}

exports.Header = Header;