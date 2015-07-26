'use strict';

var util = require('util');
var objectAssign = require('object-assign');

var error = require('../error');
var Event = require('./event');

/**
 * Construct a new MetaEvent
 *
 * @class MetaEvent
 * @extends Event
 * @classdesc A meta MIDI event, only encountered in Standard MIDI files
 * as holds information about the file
 *
 * @param {MetaEvent.TYPE} type Type of meta event
 * @param {Object} [data={}] Event data (@see MetaEvent.TYPE)
 * @param {number} [delay=0] Meta info delay in ticks
 * @throws {module:midijs/lib/error~MIDIInvalidEventError}
 * Invalid meta event type
 */
function MetaEvent(type, data, delay) {
    var defaults;
    Event.call(this, delay);

    switch (type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        defaults = {number: 0};
        break;
    case MetaEvent.TYPE.TEXT:
    case MetaEvent.TYPE.COPYRIGHT_NOTICE:
    case MetaEvent.TYPE.SEQUENCE_NAME:
    case MetaEvent.TYPE.INSTRUMENT_NAME:
    case MetaEvent.TYPE.LYRICS:
    case MetaEvent.TYPE.MARKER:
    case MetaEvent.TYPE.CUE_POINT:
    case MetaEvent.TYPE.PROGRAM_NAME:
    case MetaEvent.TYPE.DEVICE_NAME:
        defaults = {text: ''};
        break;
    case MetaEvent.TYPE.MIDI_CHANNEL:
        defaults = {channel: 0};
        break;
    case MetaEvent.TYPE.MIDI_PORT:
        defaults = {port: 0};
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        defaults = {};
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        defaults = {tempo: 120};
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        defaults = {
            rate: 24,
            hours: 0,
            minutes: 0,
            seconds: 0,
            frames: 0,
            subframes: 0
        };
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        defaults = {
            numerator: 4,
            denominator: 4,
            metronome: 24,
            clockSignalsPerBeat: 24
        };
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        defaults = {
            note: 0,
            major: true
        };
        break;
    case MetaEvent.TYPE.SEQUENCER_SPECIFIC:
        defaults = {bytes: new Buffer(0)};
        break;
    default:
        throw new error.MIDIInvalidEventError(
            'Invalid MetaEvent type "' + type + '"'
        );
    }

    this.type = type;
    this.data = objectAssign(defaults, data);
}

util.inherits(MetaEvent, Event);
module.exports = MetaEvent;

/**
 * Types of meta events, including the properties
 * that should be passed along with them
 *
 * @readonly
 * @enum {number}
 */
MetaEvent.TYPE = {
    /** Sequence number of this track. Should always be at the start
     *  of a track, with a delay of 0
      * {number} [data.number=0] Sequence number */
    SEQUENCE_NUMBER: 0,
    /** Arbitrary text (comments, notes, ...)
     * {string} [data.text=''] Text */
    TEXT: 1,
    /** Copyright of this file (© YYYY, Author). Should always be at the
     *  start of a track, with a delay of 0
      * {string} [data.text=''] Copyright notice */
    COPYRIGHT_NOTICE: 2,
    /** Name of the track. Should always be at the start of a track,
     *  with a delay of 0
      * {string} [data.text=''] Sequence name */
    SEQUENCE_NAME: 3,
    /** Name of the instrument used in this track
     * {string} [data.text=''] Instrument name */
    INSTRUMENT_NAME: 4,
    /** Lyrics to be sung at this point of the song
     * {string} [data.text=''] Lyrics */
    LYRICS: 5,
    /** Mark a significant point in the song
     * {string} [data.text=''] Marker */
    MARKER: 6,
    /** Mark a point where some type of action should start
     * {string} [data.text=''] Cue point */
    CUE_POINT: 7,
    /** Embed the patch/program name that is called up by the
     *  immediately subsequent Bank Select and Program Change messages.
     * {string} [data.text=''] Program name */
    PROGRAM_NAME: 8,
    /** Identify the hardware device used to produce sounds for this track.
     * {string} [props.text=''] Device name */
    DEVICE_NAME: 9,
    /** Associate following events to given channel
     * @deprecated */
    MIDI_CHANNEL: 32,
    /** The MIDI port used to get around 16 MIDI channels limit
     * @deprecated */
    MIDI_PORT: 33,
    /** Mark the end of the track */
    END_OF_TRACK: 47,
    /** Change the tempo for the next events
     * {number} [data.tempo=120] Tempo in beats per minute */
    SET_TEMPO: 81,
    /** Set the SMPTE starting point relative to the beginning of the track
     * {number} [data.rate=24] Frame rate (24, 25, 30 fps)
     * {number} [data.hours=0] Hour offset (0 - 23)
     * {number} [data.minutes=0] Minute offset (0 - 59)
     * {number} [data.seconds=0] Second offset (0 - 59)
     * {number} [data.frames=0] Frame offset (0 - rate)
     * {number} [data.subframes=0] Subframe offset (0 - 99) */
    SMPTE_OFFSET: 84,
    /** Change the time signature
     * {number} [data.numerator=4] Numerator
     * {number} [data.denominator=4] Denominator
     * {number} [data.metronome=24] Frequency (clock signals per click)
     * {number} [data.clockSignalsPerBeat=24] Clock signals per beat */
    TIME_SIGNATURE: 88,
    /** Change the key signature
     * {boolean} [data.major=true] Major or minor
     * {number} [data.note=0] Number of sharps (>0), or flats (<0) */
    KEY_SIGNATURE: 89,
    /** Add sequencer-specific data
     * {Buffer} [data.data=new Buffer(0)] Message bytes */
    SEQUENCER_SPECIFIC: 127
};
