'use strict';

var util = require('util');
var objectAssign = require('object-assign');

var buffer = require('../util/buffer');
var error = require('../util/error');
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
 * @static
 * @enum {number}
 */
ChannelEvent.TYPE = Object.freeze({
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
});

/**
 * @inheritdoc
 * @param {number} type Channel event type
 * @param {number} channel Channel this event applies to
 */
ChannelEvent._decodeInternal = function (buf, delay, type, channel) {
    var data = {};

    buffer.start(buf);

    switch (type) {
    case ChannelEvent.TYPE.NOTE_OFF:
        data.note = buffer.readUIntLE(buf, 1);
        data.velocity = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.NOTE_ON:
        data.note = buffer.readUIntLE(buf, 1);
        data.velocity = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        data.note = buffer.readUIntLE(buf, 1);
        data.pressure = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        data.controller = buffer.readUIntLE(buf, 1);
        data.value = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        data.program = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        data.pressure = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        data.value = buffer.readUIntLE(buf, 1) +
            (buffer.readUIntLE(buf, 1) << 7) - 8192;
        break;
    }

    buffer.end(buf);
    return new ChannelEvent(type, data, channel, delay);
};

/**
 * @inheritdoc
 */
ChannelEvent.prototype._encodeInternal = function () {
    var result, buf, value;

    switch (this.type) {
    case ChannelEvent.TYPE.NOTE_OFF:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.note);
        buffer.writeUIntLE(buf, 1, this.data.velocity);
        break;
    case ChannelEvent.TYPE.NOTE_ON:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.note);
        buffer.writeUIntLE(buf, 1, this.data.velocity);
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.note);
        buffer.writeUIntLE(buf, 1, this.data.pressure);
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.controller);
        buffer.writeUIntLE(buf, 1, this.data.value);
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        buf = new Buffer(1);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.program);
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        buf = new Buffer(1);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.pressure);
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        buf = new Buffer(2);
        buffer.start(buf);

        value = this.data.value + 8192;
        buffer.writeUIntLE(buf, 1, value & 0x7F);
        buffer.writeUIntLE(buf, 1, value >> 7);
        break;
    default:
        throw new error.MIDIEncoderError(
            this.type,
            'known ChannelEvent type'
        );
    }

    result = new Buffer(buf.length + 1);
    buffer.start(result);

    buffer.writeUIntLE(result, 1, (this.type << 4) + this.channel);
    buffer.copy(result, buf);

    buffer.end(result);
    return result;
};
