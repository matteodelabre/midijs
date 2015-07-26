'use strict';

var util = require('util');
var objectAssign = require('object-assign');

var error = require('../error');
var Event = require('./event');

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
 * @param {Object} [data={}] Event data (@see ChannelEvent.TYPE)
 * @param {number} [channel=0] Channel to which the event applies
 * @param {number} [delay=0] Channel event delay in ticks
 * @throws {module:midijs/lib/error~MIDIInvalidEventError}
 * Invalid channel event type
 */
function ChannelEvent(type, data, channel, delay) {
    var defaults;
    Event.call(this, delay);

    switch (type) {
    case ChannelEvent.TYPE.NOTE_OFF:
        defaults = {
            note: 0,
            velocity: 127
        };
        break;
    case ChannelEvent.TYPE.NOTE_ON:
        defaults = {
            note: 0,
            velocity: 127
        };
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        defaults = {
            note: 0,
            pressure: 0
        };
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        defaults = {
            controller: 0,
            value: 127
        };
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        defaults = {program: 0};
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        defaults = {pressure: 0};
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        defaults = {value: 0};
        break;
    default:
        throw new error.MIDIInvalidEventError(
            'Invalid ChannelEvent type "' + type + '"'
        );
    }

    this.type = type;
    this.channel = channel || 0;
    this.data = objectAssign(defaults, data);
}

util.inherits(ChannelEvent, Event);
module.exports = ChannelEvent;

/**
 * Types of channel events, including the properties
 * that should be passed along with them
 *
 * @readonly
 * @enum {number}
 */
ChannelEvent.TYPE = {
    /** Set a note off
     * {number} [data.note=0] Event note
     * {number} [data.velocity=127] Note velocity */
    NOTE_OFF: 8,
    /** Set a note on
     * {number} [data.note=0] Event note
     * {number} [data.velocity=127] Note velocity */
    NOTE_ON: 9,
    /** Change the pressure applied on a note
     * {number} [data.note=0] Event note
     * {number} [data.pressure=0] Note pressure */
    NOTE_AFTERTOUCH: 10,
    /** Set the value of a controller
     * {number} [data.controller=0] Controller type
     * {number} [data.value=127] Controller value */
    CONTROLLER: 11,
    /** Change the program on a channel
     * {number} [data.program=0] General MIDI program ID */
    PROGRAM_CHANGE: 12,
    /** Change the global pressure on a channel
     * {number} [data.pressure=0] Global channel pressure */
    CHANNEL_AFTERTOUCH: 13,
    /** Change the pitch on a channel
     * {number} [data.value=0] Pitch bend value (-8192 - 8191) */
    PITCH_BEND: 14
};
