'use strict';

var chunk = require('./chunk');
var Track = require('./track');

var MalformedError = require('../util/errors').MalformedError;
var buffer = require('../util/buffer');
var selectConst = require('../util/select-const');

/**
 * @class File
 * @classdesc A Standard MIDI File, that can be decoded
 * from an existing file and can be encoded back to a
 * byte sequence
 *
 * @example <caption>Decoding a MIDI file to read its channel events</caption>
 * var File = require('midijs').File;
 * var ChannelEvent = require('midijs').events.ChannelEvent;
 * var fs = require('fs');
 *
 * fs.readFile('Ode to Joy.mid', function (err, data) {
 *     var tune;
 *
 *     if (err) {
 *         throw err;
 *     }
 *
 *     tune = File.decode(data);
 *     tune.tracks.forEach(function (track) {
 *         track.events.forEach(function (event) {
 *             if (event instanceof ChannelEvent) {
 *                 // this is a channel event, use it
 *             }
 *         });
 *     });
 * });
 *
 * @example <caption>Creating a MIDI file and encoding it</caption>
 * var File = require('midijs').File;
 * var fs = require('fs');
 * var tune = new File('sync tracks');
 * var spacer = 24;
 *
 * tune.track()
 *     .meta('time signature')
 *     .meta('key signature')
 *     .meta('set tempo')
 * .end().track()
 *     .meta('sequence name', {
 *         text: 'Ode to Joy'
 *     })
 *     .channel('program change', {
 *         instrument: 'string ensemble 1'
 *     }, 0)
 *     // add "note on" events here
 *     // see the file in 'tests/fixtures/tune.js' for
 *     // more details
 * .end();
 *
 * fs.writeFile('Ode to Joy.mid', tune.encode(), function (err) {
 *     if (err) {
 *         throw err;
 *     }
 *
 *     console.log('Beethoven saved.');
 * });
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
 * @param {Buffer} buf Bytes of the file to be read
 * @throws {MalformedError} If the file is malformed in such a way
 * that can't be recovered, e.g. an invalid sequence of chunks
 * or a invalid event sequence
 * @see Track.decode, Event.decode
 * @return {File} File instance constructed from the file data
 */
File.decode = function (buf) {
    var decoded, data, type, tracks = [], ticksPerBeat;

    buffer.start(buf);
    decoded = chunk.decode(buf);
    data = decoded.data;

    if (decoded.type !== 'MThd') {
        throw new MalformedError('This is not a MIDI file');
    }

    buffer.start(data);
    type = buffer.readUIntBE(data, 2);
    buffer.seek(data, buffer.tell(data) + 2); // ignore "tracks count" field
    ticksPerBeat = buffer.readUIntBE(data, 2);

    while (!buffer.eof(buf)) {
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
 * @return {Buffer} Buffer of encoded SMF bytes
 */
File.prototype.encode = function () {
    var header = new Buffer(6), type = this.type,
        tracks = this.tracks;

    buffer.start(header);
    buffer.writeUIntBE(header, 2, type);
    buffer.writeUIntBE(header, 2, tracks.length);
    buffer.writeUIntBE(header, 2, this.ticksPerBeat & 0x7FFF);
    buffer.end(header);

    // only keep the first track in single track mode
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
