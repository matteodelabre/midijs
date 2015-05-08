/**
 * @private
 * @module midijs/lib/file/event
 */

'use strict';

var util = require('util');
var buffer = require('buffer');
var error = require('../error');

/**
 * Event
 *
 * Represent an abstract MIDI event
 *
 * @abstract
 * @constructor
 * @param {Object} [specs={}] - Event details
 * @param {Number} [defaults={}] - Event delay in ticks
 * @param {Number} [delay=0] - Event delay in ticks
 * @property {Number} delay - Event delay in ticks
 */
function Event(specs, defaults, delay) {
    var name;

    this.delay = delay || 0;
    specs = specs || {};

    for (name in defaults) {
        if (defaults.hasOwnProperty(name)) {
            if (specs.hasOwnProperty(name)) {
                this[name] = specs[name];
            } else {
                this[name] = defaults[name];
            }
        }
    }
}

exports.Event = Event;

/**
 * MetaEvent
 *
 * Represent a meta event. This type of event only occurs in Standard
 * MIDI files and are not transmitted to MIDI devices. They are only
 * meant to contain metadata about the file
 *
 * @constructor
 * @extends Event
 * @param {module:midijs/lib/file/event~MetaEvent.TYPE} type - Meta type
 * @property {module:midijs/lib/file/event~MetaEvent.TYPE} type - Meta type
 * @param {Object} [specs={}] - Meta details
 * @param {Number} [specs.number=0] - Sequence number (SEQUENCE_NUMBER)
 * @param {String} [specs.text=''] - Text (TEXT)
 * @param {String} [specs.text=''] - Copyright notice (COPYRIGHT_NOTICE)
 * @param {String} [specs.text=''] - Sequence name (SEQUENCE_NAME)
 * @param {String} [specs.text=''] - Instrument name (INSTRUMENT_NAME)
 * @param {String} [specs.text=''] - Lyrics (LYRICS)
 * @param {String} [specs.text=''] - Marker (MARKER)
 * @param {String} [specs.text=''] - Cue point (CUE_POINT)
 * @param {String} [specs.text=''] - Program name (PROGRAM_NAME)
 * @param {String} [specs.text=''] - Device name (DEVICE_NAME)
 * @param {Number} [specs.channelPrefix=0] - Channel prefix (CHANNEL_PREFIX)
 * @param {Number} [specs.tempo=120]
 * Tempo in beats per minute (SET_TEMPO)
 * @param {Number} [specs.rate=24]
 * Frame rate (24, 25, 30 fps) (SMPTE_OFFSET)
 * @param {Number} [specs.hours=0]
 * Hour offset (0 - 23) (SMPTE_OFFSET)
 * @param {Number} [specs.minutes=0]
 * Minute offset (0 - 59) (SMPTE_OFFSET)
 * @param {Number} [specs.seconds=0]
 * Second offset (0 - 59) (SMPTE_OFFSET)
 * @param {Number} [specs.frames=0]
 * Frame offset (0 - rate) (SMPTE_OFFSET)
 * @param {Number} [specs.subframes=0]
 * Subframe offset (0 - 99) (SMPTE_OFFSET)
 * @param {Number} [specs.numerator=4] - Numerator (TIME_SIGNATURE)
 * @param {Number} [specs.denominator=4] - Denominator (TIME_SIGNATURE)
 * @param {Number} [specs.metronome=24]
 * Metronome frequency in number of clock signals per click (TIME_SIGNATURE)
 * @param {Number} [specs.clockSignalsPerBeat=24]
 * Clock signals in one beat (TIME_SIGNATURE)
 * @param {Boolean} [specs.major=true]
 * Whether the key signature is major or minor (KEY_SIGNATURE)
 * @param {Number} [specs.note=0]
 * Number of sharps (if positive), or number of flats (if negative)
 * (KEY_SIGNATURE)
 * @param {Buffer} [specs.data=new Buffer(0)]
 * Message bytes (SEQUENCER_SPECIFIC)
 * @param {Number} [delay=0] - Meta info delay in ticks
 * @exception {module:midijs/lib/error~MIDIInvalidEventError}
 * Invalid meta event type
 */
function MetaEvent(type, specs, delay) {
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
        defaults.data = new buffer.Buffer(0);
        break;
    default:
        throw new error.MIDIInvalidEventError(
            'Invalid MetaEvent type "' + type + '"'
        );
    }

    this.type = type;
    Event.call(this, specs, defaults, delay);
}

util.inherits(MetaEvent, Event);
exports.MetaEvent = MetaEvent;

/**
 * Meta events types
 *
 * @readonly
 * @enum {Number}
 */
MetaEvent.TYPE = {
    /** Sequence number of this track. Should always be at the start
     *  of a track, with a delay of 0 */
    SEQUENCE_NUMBER: 0,
    /** Arbitrary text (comments, notes, ...) */
    TEXT: 1,
    /** Copyright of this file (© YYYY, Author). Should always be at the
     *  start of a track, with a delay of 0 */
    COPYRIGHT_NOTICE: 2,
    /** Name of the track. Should always be at the start of a track,
     *  with a delay of 0 */
    SEQUENCE_NAME: 3,
    /** Name of the instrument used in this track */
    INSTRUMENT_NAME: 4,
    /** Lyrics to be sung at this time in the song */
    LYRICS: 5,
    /** Mark a significant point in the song */
    MARKER: 6,
    /** Mark a point where some type of action should start */
    CUE_POINT: 7,
    /** Embed the patch/program name that is called up by the
     *  immediately subsequent Bank Select and Program Change messages. */
    PROGRAM_NAME: 8,
    /** Identify the hardware device used to produce sounds for this track. */
    DEVICE_NAME: 9,
    /** DEPRECATED: Associate following events to given channel */
    MIDI_CHANNEL: 32,
    /** DEPRECATED: The MIDI port used to get around 16 MIDI channels limit */
    MIDI_PORT: 33,
    /** Mark the end of the track */
    END_OF_TRACK: 47,
    /** Change the tempo for the next events */
    SET_TEMPO: 81,
    /** Set the SMPTE starting point relative to the beginning of the track */
    SMPTE_OFFSET: 84,
    /** Change the time signature. Default values are 4, 4, 24 and 8 */
    TIME_SIGNATURE: 88,
    /** Change the key signature */
    KEY_SIGNATURE: 89,
    /** Add sequencer-specific data */
    SEQUENCER_SPECIFIC: 127
};

/**
 * SysexEvent
 *
 * Represent a system exclusive event. These events can have various
 * meanings from device to device, and are defined by the manufacturer's
 * specification. This API only exposes the raw bytes of the message, and
 * doesn't try to interpret them
 *
 * @constructor
 * @extends Event
 * @param {Number} type - Sysex type
 * @param {Buffer} data - Sysex data
 * @param {Number} delay - Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    this.type = type;
    this.data = data;
    Event.call(this, {}, {}, delay);
}

util.inherits(SysexEvent, Event);
exports.SysexEvent = SysexEvent;

/**
 * ChannelEvent
 *
 * Represent a channel event. These events change the state of channels
 * by setting notes on, off, changing controllers parameters or channel
 * programs. They can be transmitted to the MIDI devices
 *
 * @constructor
 * @extends Event
 * @param {module:midijs/lib/file/event~ChannelEvent.TYPE}
 * type - Channel event type
 * @property {module:midijs/lib/file/event~ChannelEvent.TYPE}
 * type - Channel event type
 * @param {Object} [specs={}] - Event details
 * @param {Number} specs.note - Event note (NOTE_OFF)
 * @param {Number} specs.velocity - Note velocity (NOTE_OFF)
 * @param {Number} specs.note - Event note (NOTE_ON)
 * @param {Number} specs.velocity - Note velocity (NOTE_ON)
 * @param {Number} specs.note - Event note (NOTE_AFTERTOUCH)
 * @param {Number} specs.pressure - Note pressure (NOTE_AFTERTOUCH)
 * @param {Number} specs.controller - Controller type (CONTROLLER)
 * @param {Number} specs.value - Controller value (CONTROLLER)
 * @param {Number} specs.program - Program ID (PROGRAM_CHANGE)
 * @param {Number} specs.pressure - Global channel pressure (CHANNEL_AFTERTOUCH)
 * @param {Number} specs.value - Pitch bend value (-8192 - 8191) (PITCH_BEND)
 * @param {Number} [channel=0] - Channel to which the event applies
 * @property {Number} channel - Channel to which the event applies
 * @param {Number} [delay=0] - Event delay in ticks
 * @exception {module:midijs/lib/error~MIDIInvalidEventError}
 * Invalid channel event type
 */
function ChannelEvent(type, specs, channel, delay) {
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
    Event.call(this, specs, defaults, delay);
}

util.inherits(ChannelEvent, Event);
exports.ChannelEvent = ChannelEvent;

/**
 * Channel events types
 *
 * @readonly
 * @enum {Number}
 */
ChannelEvent.TYPE = {
    /** Set a note off */
    NOTE_OFF: 8,
    /** Set a note on */
    NOTE_ON: 9,
    /** Change the pressure applied on a note */
    NOTE_AFTERTOUCH: 10,
    /** Set the value of a controller */
    CONTROLLER: 11,
    /** Change the program on a channel */
    PROGRAM_CHANGE: 12,
    /** Change the global pressure on a channel */
    CHANNEL_AFTERTOUCH: 13,
    /** Change the pitch on a channel */
    PITCH_BEND: 14
};
