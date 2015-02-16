/**
 * @private
 * @module midijs/lib/file/header
 */

'use strict';

/**
 * Represent an Standard MIDI file Header
 *
 * @constructor
 * @param {Number} fileType - MIDI file type (0, 1, 2)
 * @param {Number} trackCount - Amount of tracks in the file
 * @param {Number} ticksPerBeat - Beats rate in ticks per beat
 */
function Header(fileType, trackCount, ticksPerBeat) {
    this._fileType = fileType || 1;
    this._trackCount = trackCount || 0;
    this._ticksPerBeat = ticksPerBeat || 120;
}

exports.Header = Header;

/**
 * Get the containing file's type
 *
 * @return {Number} MIDI file type (0, 1, 2)
 */
Header.prototype.getFileType = function () {
    return this._fileType;
};

/**
 * Get the containing file's amount of ticks per beat
 *
 * @return {Number} Beats rate in ticks per beat
 */
Header.prototype.getTicksPerBeat = function () {
    return this._ticksPerBeat;
};

/**
 * Set the containing file's type
 *
 * @param {Number} fileType - MIDI file type (0, 1, 2)
 * @return {module:midijs/lib/file/header} Current instance
 */
Header.prototype.setFileType = function (fileType) {
    this._fileType = fileType;
};

/**
 * Set the containing file's amount of ticks per beat
 *
 * @param {Number} ticksPerBeat - Beats rate in ticks per beat
 * @return {module:midijs/lib/file/header} Current instance
 */
Header.prototype.setTicksPerBeat = function (ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat;
};
