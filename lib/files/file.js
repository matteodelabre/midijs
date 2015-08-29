'use strict';

var Track = require('./track');

var MalformedError = require('../util/errors').MalformedError;
var MIDIBuffer = require('../util/buffer');
var selectConst = require('../util/select-const');

/**
 * @class File
 * @classdesc A Standard MIDI File, that can be decoded
 * from an existing file and can be encoded back to a
 * byte sequence
 *
 * @param {File.TYPE} [type=File.TYPE.SYNC_TRACKS] Type of SMF file
 * @param {Array<Track>} [tracks=[]] List of tracks in the file
 * @param {number} [ticksPerBeat=120] File's time division
 */
function File(type, tracks, ticksPerBeat) {
    var typeVal, ticksPerBeatVal;

    // define properties whose values are constrained
    Object.defineProperties(this, {
        type: {
            get: function () {
                return typeVal;
            },

            set: function (value) {
                if (typeof value === 'string') {
                    value = selectConst(File.TYPE, value);
                }

                if (isNaN(value) || value < 0 || value > 2) {
                    typeVal = File.TYPE.SYNC_TRACKS;
                } else {
                    typeVal = value;
                }
            }
        },

        ticksPerBeat: {
            get: function () {
                return ticksPerBeatVal;
            },

            set: function (value) {
                if (isNaN(value) || value < 1 || value > 65535) {
                    ticksPerBeatVal = 120;
                } else {
                    ticksPerBeatVal = value;
                }
            }
        }
    });

    this.type = type;
    this.tracks = (Array.isArray(tracks)) ? tracks : [];
    this.ticksPerBeat = ticksPerBeat;
}

module.exports = File;

/**
 * Enumeration of possible file types in a
 * Standard MIDI File
 *
 * @static
 * @readonly
 * @enum {number}
 */
File.TYPE = Object.freeze({
   /** Only one track in this file (subsequent tracks will be ignored) */
   SINGLE_TRACK: 0,

   /** One or more synchronous tracks in this file */
   SYNC_TRACKS: 1,

   /** One or more asynchronous tracks in this file */
   ASYNC_TRACKS: 2
});

/**
 * Decode a SMF file
 *
 * @static
 * @param {MIDIBuffer|Buffer|Array|*} input Data to decode
 * @throws {MalformedError} If the file is malformed in such a way
 * that can't be recovered, e.g. an invalid sequence of chunks
 * or a invalid event sequence
 * @see Track.decode, Event.decode
 * @return {File} File instance constructed from the file data
 */
File.decode = function (input) {
    var buf = new MIDIBuffer(input), decoded, data,
        type, tracks = [], ticksPerBeat;

    try {
        decoded = buf.readChunk();
        data = decoded.data;

        if (decoded.type !== 'MThd') {
            throw new Error('Wrong chunk');
        }
    } catch (e) {
        throw new MalformedError('This is not a MIDI file');
    }

    type = data.readUIntBE(16);
    data.seek(data.tell() + 2);
    ticksPerBeat = data.readUIntBE(16);

    while (!buf.eof()) {
        tracks.push(Track.decode(buf));
    }

    // only keep the first track in single track mode
    if (type === File.TYPE.SINGLE_TRACK) {
        tracks = tracks.slice(0, 1);
    }

    return new File(type, tracks, ticksPerBeat);
};

/**
 * Encode this file to a SMF representation,
 * ready to be saved as a .mid file and reused by other libs
 *
 * @return {MIDIBuffer} Buffer of encoded SMF bytes
 */
File.prototype.encode = function () {
    var header = new MIDIBuffer(6), chunk,
        type = this.type, tracks = this.tracks;

    header.writeUIntBE(16, type);
    header.writeUIntBE(16, tracks.length);
    header.writeUIntBE(16, this.ticksPerBeat & 0x7FFF);

    // only keep the first track in single track mode
    if (type === File.TYPE.SINGLE_TRACK) {
        tracks = tracks.slice(0, 1);
    }

    chunk = new MIDIBuffer(header.getLength() + 8);
    chunk.writeChunk('MThd', header);

    tracks = tracks.map(function (track) {
        return track.encode();
    });

    return MIDIBuffer.concat([chunk].concat(tracks));
};

/**
 * Add a new track to this file
 *
 * @return {Object} A set of methods for adding events to the track
 */
File.prototype.track = function () {
    var track = new Track(), that = this;
    this.tracks.push(track);

    // proxy object so that we can chain #end() correctly
    // FIXME: this introduces a tight coupling with Track
    // we can't use Proxy() because we need support for 0.10 & 0.12
    return {
        meta: function () {
            track.meta.apply(track, [].slice.call(arguments));
            return this;
        },

        sysex: function () {
            track.sysex.apply(track, [].slice.call(arguments));
            return this;
        },

        channel: function () {
            track.channel.apply(track, [].slice.call(arguments));
            return this;
        },

        note: function () {
            track.note.apply(track, [].slice.call(arguments));
            return this;
        },

        end: function () {
            track.end();
            return that;
        }
    };
};
