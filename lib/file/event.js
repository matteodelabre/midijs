'use strict';

var util = require('util');

/**
 * Event
 *
 * Represent an abstract MIDI event
 *
 * @private
 * @abstract
 * @constructor
 * @param {Object} specs -  Event details
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

/**
 * MetaEvent
 *
 * Represent a meta MIDI event. This type of event can only
 * be found in Standard MIDI files and gives details about the file.
 *
 * @constructor
 * @param {MetaEvent.TYPE} type - Meta type
 * @param {Object} specs - Meta details
 * @param {Number} specs.number - Sequence number (SEQUENCE_NUMBER)
 * @param {String} specs.text - Text (TEXT)
 * @param {String} specs.text - Copyright notice (COPYRIGHT_NOTICE)
 * @param {String} specs.text - Sequence name (SEQUENCE_NAME)
 * @param {String} specs.text - Instrument name (INSTRUMENT_NAME)
 * @param {String} specs.text - Lyrics (LYRICS)
 * @param {String} specs.text - Marker (MARKER)
 * @param {String} specs.text - Cue point (CUE_POINT)
 * @param {Number} specs.channelPrefix - Channel prefix (CHANNEL_PREFIX)
 * @param {Number} specs.tempo - Tempo in beats per minute (SET_TEMPO)
 * @param {Number} specs.tempo - Tempo in beats per minute (SET_TEMPO)
 * @param {Number} specs.rate - Frame rate (24, 25, 30 fps) (SMPTE_OFFSET)
 * @param {Number} specs.hours - Hour offset (0 - 23) (SMPTE_OFFSET)
 * @param {Number} specs.minutes - Minute offset (0 - 59) (SMPTE_OFFSET)
 * @param {Number} specs.seconds - Second offset (0 - 59) (SMPTE_OFFSET)
 * @param {Number} specs.frames - Frame offset (0 - rate) (SMPTE_OFFSET)
 * @param {Number} specs.subframes - Subframe offset (0 - 99) (SMPTE_OFFSET)
 * @param {Number} specs.numerator - Numerator (TIME_SIGNATURE)
 * @param {Number} specs.denominator - Denominator (TIME_SIGNATURE)
 * @param {Number} specs.metronome - Metronome frequency in number of clock
 *                                   signals per click (TIME_SIGNATURE)
 * @param {Number} specs.clockSignalsPerBeat - Clock signals in
 *                                             one beat(TIME_SIGNATURE)
 * @param {Boolean} specs.major - Whether the key signature is major or
 *                                minor (KEY_SIGNATURE)
 * @param {Number} specs.note - Number of sharps (if positive), or number of
 *                              flats (if negative) (KEY_SIGNATURE)
 * @param {Buffer} specs.data - Message bytes (SEQUENCER_SPECIFIC)
 * @param {Number} delay - Meta info delay in ticks
 * @property {String} type - Meta type
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
    SEQUENCE_NUMBER: 0,
    TEXT: 1,
    COPYRIGHT_NOTICE: 2,
    SEQUENCE_NAME: 3,
    INSTRUMENT_NAME: 4,
    LYRICS: 5,
    MARKER: 6,
    CUE_POINT: 7,
    CHANNEL_PREFIX: 32,
    END_OF_TRACK: 47,
    SET_TEMPO: 81,
    SMPTE_OFFSET: 84,
    TIME_SIGNATURE: 88,
    KEY_SIGNATURE: 89,
    SEQUENCER_SPECIFIC: 127
};

/**
 * SysexEvent
 *
 * Represent a sysex MIDI event. This type of event is
 * device-specific and requires a Sysex elevation to be
 * read from an input.
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
 * Represent a channel MIDI event. This type of event changes
 * the state of channels by setting notes on and off or
 * changing controllers values.
 *
 * @constructor
 * @param {ChannelEvent.TYPE} type - Channel event type
 * @param {Object} specs - Event details
 * @param {Number} specs.note - Event note (NOTE_OFF, NOTE_ON,
 *                              NOTE_AFTERTOUCH)
 * @param {Number} specs.velocity - Note velocity (NOTE_OFF, NOTE_ON)
 * @param {Number} specs.pressure - Note(s) pressure
 *                                  (NOTE_AFTERTOUCH, CHANNEL_AFTERTOUCH)
 * @param {Number} specs.controller - Controller type (CONTROLLER)
 * @param {Number} specs.value - Controller value (CONTROLLER)
 * @param {Number} specs.value - Pitch bend value (-8192 - 8191) (PITCH_BEND)
 * @param {Number} channel - Channel ID to which the event applies
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
    NOTE_OFF: 8,
    NOTE_ON: 9,
    NOTE_AFTERTOUCH: 10,
    CONTROLLER: 11,
    PROGRAM_CHANGE: 12,
    CHANNEL_AFTERTOUCH: 13,
    PITCH_BEND: 14
};
