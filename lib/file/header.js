'use strict';

var error = require('../error');

/**
 * Construct a new Header
 *
 * @class Header
 * @classdesc A Standard MIDI File's header (contains various metadata)
 *
 * @param {Header.FILE_TYPE} [fileType=SYNC_TRACKS] File type
 * @param {number} [ticksPerBeat=120] Beats rate in ticks per beat
 */
function Header(fileType, trackCount, ticksPerBeat) {
    this.fileType = Object.defineProperty(this, {

    });

    this.ticksPerBeat = Object.defineProperty(this, {

    })

    this._fileType = fileType || Header.FILE_TYPE.SYNC_TRACKS;
    this._ticksPerBeat = ticksPerBeat || 120;
}

exports.Header = Header;

/**
 * Enumeration of possible file types in a
 * Standard MIDI File
 *
 * @static
 * @readonly
 * @enum {number}
 */
Header.FILE_TYPE = Object.freeze({
    /** Only one track in this file (subsequent tracks will be ignored) */
    SINGLE_TRACK: 0,

    /** One or more synchronous tracks in this file */
    SYNC_TRACKS: 1,

    /** One or more asynchronous tracks in this file */
    ASYNC_TRACKS: 2
});

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
 * @return {number} Beats rate in ticks per beat
 */
Header.prototype.getTicksPerBeat = function () {
    return this._ticksPerBeat;
};

/**
 * Set the containing file's type
 *
 * @param {module:midijs/lib/file/header~Header.FILE_TYPE}
 * fileType MIDI file type
 * @throws {module:midijs/lib/error~MIDIInvalidArgument}
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
 * @param {number} ticksPerBeat Beats rate in ticks per beat
 * @throws {module:midijs/lib/error~MIDIInvalidArgument}
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
