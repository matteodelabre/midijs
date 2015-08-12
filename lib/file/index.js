'use strict';

var chunk = require('./chunk');
var Track = require('./track');

var error = require('../util/error');
var buffer = require('../util/buffer');

/**
 * Construct a new File
 *
 * @class File
 * @classdesc A Standard MIDI File, storing all kinds of MIDI events
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
 * @param {Buffer} buf Bytes to read
 * @throws {MIDIDecodeError} If decoding encountered a fatal error
 * @see Track.decode, Event.decode
 * @return {File} Decoded file representation
 */
File.decode = function (buf) {
    var decoded, data, type, tracks = [], ticksPerBeat;

    buffer.start(buf);
    decoded = chunk.decode(buf);
    data = decoded.data;

    if (decoded.type !== 'MThd') {
        throw new error.MIDIDecodeError('This is not a MIDI file');
    }

    buffer.start(data);
    type = buffer.readUIntBE(data, 2);
    buffer.readUIntBE(data, 2); // this is "tracks count", but we ignore it
    ticksPerBeat = buffer.readUIntBE(data, 2);

    while (!buffer.eof(buf)) {
        tracks.push(Track.decode(buf));
    }

    // only keep the first track if on single mode
    if (type === File.TYPE.SINGLE_TRACK) {
        tracks = tracks.slice(0, 1);
    }

    return new File(type, tracks, ticksPerBeat);
};

/**
 * Encode this file to SMF bytes
 *
 * @return {Buffer} Encoded bytes
 */
File.prototype.encode = function () {
    var header = new Buffer(6), type = this.type,
        tracks = this.tracks;

    buffer.start(header);
    buffer.writeUIntBE(header, 2, type);
    buffer.writeUIntBE(header, 2, tracks.length);
    buffer.writeUIntBE(header, 2, this.ticksPerBeat & 0x7FFF);
    buffer.end(header);

    // only keep the first track if on single mode
    if (type === File.TYPE.SINGLE_TRACK) {
        tracks = tracks.slice(0, 1);
    }

    header = chunk.encode('MThd', header);
    tracks = tracks.map(function (track) {
        return track.encode();
    });

    return Buffer.concat([header].concat(tracks));
};

/**
 * Add a new track to this file
 *
 * @return {Object} Composition object
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

        end: function () {
            track.end();
            return that;
        }
    };
};
