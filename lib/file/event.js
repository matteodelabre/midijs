'use strict';

var util = require('util');
var error = require('../error');

/**
 * Construct a new Event
 *
 * @abstract
 * @class Event
 * @classdesc Any type of MIDI event
 *
 * @param {Object} [props={}] Event properties
 * @param {number} [defaults={}] Default event properties
 * @param {number} [delay=0] Event delay in ticks
 */
function Event(props, defaults, delay) {
    var name;

    this.delay = delay || 0;
    props = props || {};

    for (name in defaults) {
        if (defaults.hasOwnProperty(name)) {
            if (props.hasOwnProperty(name)) {
                this[name] = props[name];
            } else {
                this[name] = defaults[name];
            }
        }
    }
}

exports.Event = Event;

/**
 * Construct a new MetaEvent
 *
 * @class MetaEvent
 * @extends Event
 * @classdesc A meta MIDI event, only encountered in Standard MIDI files
 * as holds information about the file
 *
 * @param {MetaEvent.TYPE} type Type of meta event
 * @param {Object} [props={}] Event properties (@see MetaEvent.TYPE)
 * @param {number} [delay=0] Meta info delay in ticks
 * @throws {module:midijs/lib/error~MIDIInvalidEventError}
 * Invalid meta event type
 */
function MetaEvent(type, props, delay) {
    var defaults = {};

    switch (type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        defaults.number = 0;
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
        defaults.text = '';
        break;
    case MetaEvent.TYPE.MIDI_CHANNEL:
        defaults.channel = 0;
        break;
    case MetaEvent.TYPE.MIDI_PORT:
        defaults.port = 0;
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        defaults.tempo = 120;
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        defaults.rate = 24;
        defaults.hours = 0;
        defaults.minutes = 0;
        defaults.seconds = 0;
        defaults.frames = 0;
        defaults.subframes = 0;
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        defaults.numerator = 4;
        defaults.denominator = 4;
        defaults.metronome = 24;
        defaults.clockSignalsPerBeat = 24;
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        defaults.note = 0;
        defaults.major = true;
        break;
    case MetaEvent.TYPE.SEQUENCER_SPECIFIC:
        defaults.data = new Buffer(0);
        break;
    default:
        throw new error.MIDIInvalidEventError(
            'Invalid MetaEvent type "' + type + '"'
        );
    }

    this.type = type;
    Event.call(this, props, defaults, delay);
}

util.inherits(MetaEvent, Event);
exports.MetaEvent = MetaEvent;

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
      * {number} [props.number=0] Sequence number */
    SEQUENCE_NUMBER: 0,
    /** Arbitrary text (comments, notes, ...)
     * {string} [props.text=''] Text */
    TEXT: 1,
    /** Copyright of this file (© YYYY, Author). Should always be at the
     *  start of a track, with a delay of 0
      * {string} [props.text=''] Copyright notice */
    COPYRIGHT_NOTICE: 2,
    /** Name of the track. Should always be at the start of a track,
     *  with a delay of 0
      * {string} [props.text=''] Sequence name */
    SEQUENCE_NAME: 3,
    /** Name of the instrument used in this track
     * {string} [props.text=''] Instrument name */
    INSTRUMENT_NAME: 4,
    /** Lyrics to be sung at this point of the song
     * {string} [props.text=''] Lyrics */
    LYRICS: 5,
    /** Mark a significant point in the song
     * {string} [props.text=''] Marker */
    MARKER: 6,
    /** Mark a point where some type of action should start
     * {string} [props.text=''] Cue point */
    CUE_POINT: 7,
    /** Embed the patch/program name that is called up by the
     *  immediately subsequent Bank Select and Program Change messages.
     * {string} [props.text=''] Program name */
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
     * {number} [props.tempo=120] Tempo in beats per minute */
    SET_TEMPO: 81,
    /** Set the SMPTE starting point relative to the beginning of the track
     * {number} [props.rate=24] Frame rate (24, 25, 30 fps)
     * {number} [props.hours=0] Hour offset (0 - 23)
     * {number} [props.minutes=0] Minute offset (0 - 59)
     * {number} [props.seconds=0] Second offset (0 - 59)
     * {number} [props.frames=0] Frame offset (0 - rate)
     * {number} [props.subframes=0] Subframe offset (0 - 99) */
    SMPTE_OFFSET: 84,
    /** Change the time signature
     * {number} [props.numerator=4] Numerator
     * {number} [props.denominator=4] Denominator
     * {number} [props.metronome=24] Frequency (clock signals per click)
     * {number} [props.clockSignalsPerBeat=24] Clock signals per beat */
    TIME_SIGNATURE: 88,
    /** Change the key signature
     * {boolean} [props.major=true] Major or minor
     * {number} [props.note=0] Number of sharps (>0), or flats (<0) */
    KEY_SIGNATURE: 89,
    /** Add sequencer-specific data
     * {Buffer} [props.data=new Buffer(0)] Message bytes */
    SEQUENCER_SPECIFIC: 127
};

/**
 * Construct a SysexEvent
 *
 * @class SysexEvent
 * @extends Event
 * @classdesc A system exclusive MIDI event. This kind of event is
 * not formally defined by the specification and can hold any kind
 * of data. Its contents depends on the manufacturer, thus, this API
 * does not try to interpret them but only passes the data along
 *
 * @param {number} type Sysex type
 * @param {Buffer} data Sysex data
 * @param {number} delay Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    this.type = type;
    this.data = data;
    Event.call(this, {}, {}, delay);
}

util.inherits(SysexEvent, Event);
exports.SysexEvent = SysexEvent;

/**
 * Construct a ChannelEvent
 *
 * @class ChannelEvent
 * @extends Event
 * @classdesc A channel MIDI event. This kind of event is the most important
 * one, it describes the state of the instruments, relative to the previous
 * state. Channel events can be transmitted between devices and can
 * also be present in Standard MIDI files.
 *
 * @param {ChannelEvent.TYPE} type Type of channel event
 * @param {Object} [props={}] Event properties
 * @param {number} [channel=0] Channel to which the event applies
 * @param {number} [delay=0] Channel event delay in ticks
 * @throws {module:midijs/lib/error~MIDIInvalidEventError}
 * Invalid channel event type
 */
function ChannelEvent(type, props, channel, delay) {
    var defaults = {};

    switch (type) {
    case ChannelEvent.TYPE.NOTE_OFF:
        defaults.note = 0;
        defaults.velocity = 127;
        break;
    case ChannelEvent.TYPE.NOTE_ON:
        defaults.note = 0;
        defaults.velocity = 127;
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        defaults.note = 0;
        defaults.pressure = 0;
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        defaults.controller = 0;
        defaults.value = 127;
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        defaults.program = 0;
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        defaults.pressure = 0;
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        defaults.value = 0;
        break;
    default:
        throw new error.MIDIInvalidEventError(
            'Invalid ChannelEvent type "' + type + '"'
        );
    }

    this.type = type;
    this.channel = channel || 0;
    Event.call(this, props, defaults, delay);
}

util.inherits(ChannelEvent, Event);
exports.ChannelEvent = ChannelEvent;

/**
 * Types of channel events, including the properties
 * that should be passed along with them
 *
 * @readonly
 * @enum {number}
 */
ChannelEvent.TYPE = {
    /** Set a note off
     * {number} props.note Event note
     * {number} props.velocity Note velocity */
    NOTE_OFF: 8,
    /** Set a note on
     * {number} props.note Event note
     * {number} props.velocity Note velocity */
    NOTE_ON: 9,
    /** Change the pressure applied on a note
     * {number} props.note Event note
     * {number} props.pressure Note pressure */
    NOTE_AFTERTOUCH: 10,
    /** Set the value of a controller
     * {number} props.controller Controller type
     * {number} props.value Controller value */
    CONTROLLER: 11,
    /** Change the program on a channel
     * {number} props.program Program ID */
    PROGRAM_CHANGE: 12,
    /** Change the global pressure on a channel
     * {number} props.pressure Global channel pressure */
    CHANNEL_AFTERTOUCH: 13,
    /** Change the pitch on a channel
     * {number} props.value Pitch bend value (-8192 - 8191) */
    PITCH_BEND: 14
};
