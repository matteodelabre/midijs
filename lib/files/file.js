'use strict';

const stampit = require('stampit');

const Track = require('./track');
const MIDIBuffer = require('../util/buffer');
const nonMIDI = require('../util/constants').nonMIDIError;

const fileTypes = ['single', 'sync', 'async'];

/**
 * File stamp
 *
 * Represents a MIDI File, containing MIDI notes and metadata
 * that can be encoded to the standard MIDI format. Calling this
 * stamp will create a new blank file. To import an existing MIDI
 * file, use `File.decode`.
 *
 * @param {Object} [args={}] File arguments
 * @param {string} [args.type='sync'] Type of file ('single' for files with
 * only one track, 'sync' for multiple synced tracks, 'async' for multiple
 * following tracks)
 * @param {number} [args.ticksPerBeat=120] File's time division
 * @param {Array<Track>} [args.tracks=[]] Initial list of tracks in the file
 */
const File = stampit().init(ctx => {
    const instance = ctx.instance;

    // internal values for the type and tickPerBeat props
    let type, ticksPerBeat;

    // this method is run after stamp initialization, so the
    // properties have already been merged. Store them so that
    // we can assign them later.
    // (this is a hack. waiting for stampit v3.0 [propertyDescriptors])
    const initialType = instance.type;
    const initialTicksPerBeat = instance.ticksPerBeat;

    // define properties whose values are constrained
    Object.defineProperties(instance, {
        type: {
            get() {
                return type;
            },

            set(value) {
                if (fileTypes.indexOf(value) === -1) {
                    throw new Error('Invalid file type "' + value + '"');
                }

                type = value;
            }
        },

        ticksPerBeat: {
            get() {
                return ticksPerBeat;
            },

            set(value) {
                if (isNaN(value) || value < 1 || value > 65535) {
                    throw new Error('Invalid ticks per beat value "' + value + '"');
                }

                ticksPerBeat = value;
            }
        }
    });

    // apply previously merged props through validators
    instance.type = initialType;
    instance.ticksPerBeat = initialTicksPerBeat;
}).props({
    /**
     * @prop {string} type Type of file ('single' for files with
     * only one track, 'sync' for multiple synced tracks, 'async' for multiple
     * following tracks)
     */
    type: 'sync',

    /**
     * @prop {number} ticksPerBeat File's time division
     */
    ticksPerBeat: 120,

    /**
     * @prop {Array} tracks List of current file's tracks
     */
    tracks: []
}).static({
    /**
     * Decode a MIDI file
     *
     * @static
     * @param {MIDIBuffer|Buffer|Array|*} input Data to decode
     * @throws {Error} If the file is malformed in such a way
     * that can't be recovered, e.g. an invalid sequence of chunks
     * or a invalid event sequence
     * @see Track.decode, Event.decode
     * @return {Object} File instance constructed from the file data
     */
    decode(input) {
        const buf = new MIDIBuffer(input);
        let tracks = [], decoded, data, type, ticksPerBeat;

        // read the file's header chunk
        try {
            decoded = buf.readChunk();
            data = decoded.data;
        } catch (e) {
            // absorb out-of-range errors as invalid MIDI errors
            throw new Error(
                nonMIDI + ': could not read file header ' +
                '(' + e.message + ')'
            );
        }

        if (decoded.type !== 'MThd') {
            throw new Error(
                nonMIDI + ': unexpected ' + decoded.type + ' chunk while ' +
                'reading the file. Expected a header (MThd) chunk.'
            );
        }

        try {
            type = data.readUIntBE(16);
            data.seek(data.tell() + 2);
            ticksPerBeat = data.readUIntBE(16);
        } catch (e) {
            // absorb out-of-range errors as invalid MIDI errors
            throw new Error(
                nonMIDI + ': could not read header fields ' +
                '(' + e.message + ')'
            );
        }

        if (fileTypes[type] === undefined) {
            throw new Error(
                nonMIDI + ': unknown file type ' + type + '. Expected ' +
                '0 (single), 1 (sync), or 2 (async).'
            );
        }

        type = fileTypes[type];

        // read all the tracks in the file
        while (!buf.eof()) {
            tracks.push(Track.decode(buf));
        }

        // only keep the first track in single track mode
        if (type === 'single') {
            tracks = tracks.slice(0, 1);
        }

        return File({type, tracks, ticksPerBeat});
    }
}).methods({
    /**
     * Encode this file to the standard MIDI format,
     * ready to be saved as a .mid file and reused by other libs
     *
     * @return {Buffer} Buffer of MIDI bytes
     */
    encode() {
        const header = new MIDIBuffer(6);
        const type = this.type, tracks = this.tracks;

        header.writeUIntBE(16, fileTypes.indexOf(type));
        header.writeUIntBE(16, tracks.length);
        header.writeUIntBE(16, this.ticksPerBeat & 0x7FFF);

        if (this.tracks.length > 1 && this.type === 'single') {
            throw new Error('This single track file contains more than one track.');
        }

        const chunk = new MIDIBuffer(header.getLength() + 8);
        chunk.writeChunk('MThd', header);

        return MIDIBuffer.concat(
            [chunk].concat(tracks.map(track => track.encode()))
        ).toBuffer();
    },

    /**
     * Add a new track to this file
     *
     * @return {Object} A set of methods for adding events to the track
     */
    track() {
        const track = Track(), that = this;
        const wrappedTrack = Track.compose(stampit.methods({
            end() {
                track.end();
                return that;
            }
        }))(track);

        this.tracks.push(track);
        return wrappedTrack;
    }
});

module.exports = File;
