/**
 * @module midijs/lib/file/event
 */

'use strict';

var util = require('util');

/**
 * Event
 *
 * Represent an abstract MIDI event
 *
 * @abstract
 * @constructor
 * @param {Object} specs - Event details
 * @param {Number} delay - Event delay in ticks
 * @property {Number} delay - Event delay in ticks
 */
function Event(specs, delay) {
    var name;
    
    this.delay = delay || 0;
    specs = specs || {};
    
    for (name in specs) {
        if (specs.hasOwnProperty(name) && !this.hasOwnProperty(name)) {
            this[name] = specs[name];
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
 * @param {MetaEvent.TYPE} type - Meta type
 * @property {MetaEvent.TYPE} type - Meta type
 * @param {Object} specs - Meta details
 * @param {Number} specs.number - Sequence number
 * ({@link MetaEvent.TYPE.SEQUENCE_NUMBER})
 * @param {String} specs.text - Text
 * ({@link MetaEvent.TYPE.TEXT})
 * @param {String} specs.text - Copyright notice
 * ({@link MetaEvent.TYPE.COPYRIGHT_NOTICE})
 * @param {String} specs.text - Sequence name
 * ({@link MetaEvent.TYPE.SEQUENCE_NAME})
 * @param {String} specs.text - Instrument name
 * ({@link MetaEvent.TYPE.INSTRUMENT_NAME})
 * @param {String} specs.text - Lyrics
 * ({@link MetaEvent.TYPE.LYRICS})
 * @param {String} specs.text - Marker
 * ({@link MetaEvent.TYPE.MARKER})
 * @param {String} specs.text - Cue point
 * ({@link MetaEvent.TYPE.CUE_POINT})
 * @param {Number} specs.channelPrefix - Channel prefix
 * ({@link MetaEvent.TYPE.CHANNEL_PREFIX})
 * @param {Number} specs.tempo - Tempo in beats per minute
 * ({@link MetaEvent.TYPE.SET_TEMPO})
 * @param {Number} specs.tempo - Tempo in beats per minute
 * ({@link MetaEvent.TYPE.SET_TEMPO})
 * @param {Number} specs.rate - Frame rate (24, 25, 30 fps)
 * ({@link MetaEvent.TYPE.SMPTE_OFFSET})
 * @param {Number} specs.hours - Hour offset (0 - 23)
 * ({@link MetaEvent.TYPE.SMPTE_OFFSET})
 * @param {Number} specs.minutes - Minute offset (0 - 59)
 * ({@link MetaEvent.TYPE.SMPTE_OFFSET})
 * @param {Number} specs.seconds - Second offset (0 - 59)
 * ({@link MetaEvent.TYPE.SMPTE_OFFSET})
 * @param {Number} specs.frames - Frame offset (0 - rate)
 * ({@link MetaEvent.TYPE.SMPTE_OFFSET})
 * @param {Number} specs.subframes - Subframe offset (0 - 99)
 * ({@link MetaEvent.TYPE.SMPTE_OFFSET})
 * @param {Number} specs.numerator - Numerator
 * ({@link MetaEvent.TYPE.TIME_SIGNATURE})
 * @param {Number} specs.denominator - Denominator
 * ({@link MetaEvent.TYPE.TIME_SIGNATURE})
 * @param {Number} specs.metronome - Metronome frequency in number of clock
 *                                   signals per click
 * ({@link MetaEvent.TYPE.TIME_SIGNATURE})
 * @param {Number} specs.clockSignalsPerBeat - Clock signals in one beat
 * ({@link MetaEvent.TYPE.TIME_SIGNATURE})
 * @param {Boolean} specs.major - Whether the key signature is major or minor
 * ({@link MetaEvent.TYPE.KEY_SIGNATURE})
 * @param {Number} specs.note - Number of sharps (if positive), or number of
 *                              flats (if negative)
 * ({@link MetaEvent.TYPE.KEY_SIGNATURE})
 * @param {Buffer} specs.data - Message bytes
 * ({@link MetaEvent.TYPE.SEQUENCER_SPECIFIC})
 * @param {Number} delay - Meta info delay in ticks
 * @extends Event
 */
function MetaEvent(type, specs, delay) {
    this.type = type;
    Event.call(this, specs, delay);
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
    /** Name of the track. Should always be at the start oof a track,
     *  with a delay of 0 */
    SEQUENCE_NAME: 3,
    /** Name of the instrument used in this track, for the channel
     *  specified by the last CHANNEL_PREFIX event. Editors should use
     *  the PROGRAM_CHANGE event instead */
    INSTRUMENT_NAME: 4,
    /** Lyrics to be sung at this time in the song */
    LYRICS: 5,
    /** Mark a significant point in the song */
    MARKER: 6,
    /** Mark a point where some type of action should start */
    CUE_POINT: 7,
    /** Meta events following this event will be associated with the
     *  given channel. Effects of this event are cancelled by
     *  following non-meta events or by another CHANNEL_PREFIX event */
    CHANNEL_PREFIX: 32,
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
 * @param {Number} type - Sysex type
 * @param {Buffer} data - Sysex data
 * @param {Number} delay - Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    this.type = type;
    this.data = data;
    Event.call(this, {}, delay);
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
 * @param {ChannelEvent.TYPE} type - Channel event type
 * @property {ChannelEvent.TYPE} type - Channel event type
 * @param {Object} specs - Event details
 * @param {Number} specs.note - Event note
 * ({@link ChannelEvent.TYPE.NOTE_OFF}, {@link ChannelEvent.TYPE.NOTE_ON},
 *  {@link ChannelEvent.TYPE.NOTE_AFTERTOUCH})
 * @param {Number} specs.velocity - Note velocity
 * ({@link ChannelEvent.TYPE.NOTE_OFF}, {@link ChannelEvent.TYPE.NOTE_ON})
 * @param {Number} specs.pressure - Note(s) pressure
 * ({@link ChannelEvent.TYPE.NOTE_AFTERTOUCH},
 *  {@link ChannelEvent.TYPE.CHANNEL_AFTERTOUCH})
 * @param {Number} specs.controller - Controller type
 * ({@link ChannelEvent.TYPE.CONTROLLER})
 * @param {Number} specs.value - Controller value
 * ({@link ChannelEvent.TYPE.CONTROLLER})
 * @param {Number} specs.value - Pitch bend value (-8192 - 8191)
 * ({@link ChannelEvent.TYPE.PITCH_BEND})
 * @param {Number} channel - Channel to which the event applies
 * @property {Number} channel - Channel to which the event applies
 * @param {Number} delay - Event delay in ticks
 */
function ChannelEvent(type, specs, channel, delay) {
    this.type = type;
    this.channel = channel;
    Event.call(this, specs, delay);
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
