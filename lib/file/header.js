/**
 * @private
 * @module midijs/lib/file/header
 */

'use strict';

var error = require('../error');

/**
 * Represent an Standard MIDI file Header
 *
 * @constructor
 * @param {module:midijs/lib/file/header~Header.FILE_TYPE}
 * fileType - MIDI file type (0, 1, 2)
 * @param {Number} trackCount - Amount of tracks in the file
 * @param {Number} ticksPerBeat - Beats rate in ticks per beat
 */
function Header(fileType, trackCount, ticksPerBeat) {
    this._fileType = fileType || Header.FILE_TYPE.SYNC_TRACKS;
    this._trackCount = trackCount || 0;
    this._ticksPerBeat = ticksPerBeat || 120;
}

exports.Header = Header;

/**
 * Get the containing file's type
 *
 * @return {module:midijs/lib/file/header~Header.FILE_TYPE}
 * MIDI file type
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
 * @param {module:midijs/lib/file/header~Header.FILE_TYPE}
 * fileType - MIDI file type
 * @exception {module:midijs/lib/error~MIDIInvalidArgument}
 * Undefined file type
 * @return {module:midijs/lib/file/header} Current instance
 */
Header.prototype.setFileType = function (fileType) {
    var types = Header.FILE_TYPE, type;
    
    for (type in types) {
        if (types.hasOwnProperty(type) && fileType === types[type]) {
            this._fileType = fileType;
            return this;
        }
    }
    
    throw new error.MIDIInvalidArgument(
        'File type "' + fileType + '" is not defined. Did you mean 0, 1 or 2?'
    );
};

/**
 * Set the containing file's amount of ticks per beat
 *
 * @param {Number} ticksPerBeat - Beats rate in ticks per beat
 * @exception {module:midijs/lib/error~MIDIInvalidArgument}
 * Invalid ticks per beat amount
 * @return {module:midijs/lib/file/header} Current instance
 */
Header.prototype.setTicksPerBeat = function (ticksPerBeat) {
    if (ticksPerBeat < 1 || ticksPerBeat > 65535) {
        throw new error.MIDIInvalidArgument(
            'Ticks per beat amount should be between 0 and 65535 (got ' +
                ticksPerBeat
        );
    }
    
    this._ticksPerBeat = ticksPerBeat;
    return this;
};

/**
 * File types
 *
 * @readonly
 * @enum {Number}
 */
Header.FILE_TYPE = {
    /** Only one track in this file (subsequent tracks will be ignored) */
    SINGLE_TRACK: 0,
    
    /** One or more synchronous tracks in this file */
    SYNC_TRACKS: 1,
    
    /** One or more asynchronous tracks in this file */
    ASYNC_TRACKS: 2
};
