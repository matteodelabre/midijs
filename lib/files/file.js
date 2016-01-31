'use strict';

const stampit = require('stampit');
const encoding = require('text-encoding');

const Track = require('./track');
const MIDIView = require('../util/midiview');
const nonMIDI = require('../util/constants').nonMIDIError;

const textEncoder = encoding.TextEncoder('utf-8');
const textDecoder = encoding.TextDecoder('utf-8');
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
                    throw new Error(
                        'Cannot set invalid file type "' + value + '". ' +
                        'Expecting one of the following strings: "single", ' +
                        '"async", "sync".'
                    );
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
                    throw new Error(
                        'Cannot set invalid ticks per beat value "' +
                        value + '". Expecting an integer value between ' +
                        '1 and 65535'
                    );
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
     * @param {Uint8Array|DataView} data Data to decode
     * @throws {Error} If the file is malformed in such a way
     * that can't be recovered, e.g. an invalid sequence of chunks
     * or a invalid event sequence
     * @return {Object} File instance constructed from the file data
     */
    decode(data) {
        const view = MIDIView({buffer: data.buffer});
        const tracks = [];
        let type, ticksPerBeat;

        // read the file's header chunk
        try {
            const chunkType = textDecoder.decode(view.getUint8Array(4));

            if (chunkType !== 'MThd') {
                throw new Error(
                    'Unexpected ' + chunkType + ' chunk while decoding the ' +
                    'file\'s header. Expected a header (MThd) chunk.'
                );
            }

            const length = view.getUint32();

            if (length !== 6) {
                throw new Error(
                    'Expected 6-bytes long header chunk while decoding ' +
                    'the file. Found a ' + length + '-bytes long header.'
                );
            }

            type = view.getUint16();
            view.seek(view.tell() + 2); // skip tracks count field
            ticksPerBeat = view.getUint16();

            if (fileTypes[type] === undefined) {
                throw new Error(
                    'Unknown file type ' + type + '. Expected ' +
                    '0 (single), 1 (sync), or 2 (async).'
                );
            }

            type = fileTypes[type];
        } catch (e) {
            // absorb out-of-range errors as invalid MIDI errors
            throw new Error(
                nonMIDI + ': could not read file header ' +
                '(' + e.message + ')'
            );
        }

        // read all the tracks in the file
        while (!view.eof()) {
            tracks.push(Track.decode(view));
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
     * @return {Uint8Array} Buffer of MIDI bytes
     */
    encode() {
        const tracks = this.tracks.map(track => track.encode());
        const dataLength = tracks.reduce((value, data) => value + data.byteLength, 14);
        const view = MIDIView({buffer: new ArrayBuffer(dataLength)});

        // encode file header
        view.setUint8Array(textEncoder.encode('MThd'));
        view.setUint32(6);
        view.setUint16(fileTypes.indexOf(this.type));
        view.setUint16(tracks.length);
        view.setUint16(this.ticksPerBeat & 0x7FFF);

        if (this.tracks.length > 1 && this.type === 'single') {
            throw new Error(
                'Trying to encode a single-track (0) file that ' +
                'contains more than one track. Please remove extra tracks ' +
                'before encoding.'
            );
        }

        // encode tracks
        tracks.forEach(data => view.setUint8Array(data));
        return view.buffer;
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
