'use strict';

var buffer = require('../util/buffer');
var hex = require('../util/hex');
var error = require('../util/error');

var VarInt = require('./var-int');
var ChannelEvent = require('./channel-event');
var MetaEvent = require('./meta-event');
var SysexEvent = require('./sysex-event');

/**
 * Construct a new Event
 *
 * @abstract
 * @class Event
 * @classdesc Any type of MIDI event
 *
 * @param {number} [delay=0] Event delay in ticks
 */
function Event(delay) {
    if (this.constructor === Event) {
        throw new Error('Cannot instanciate Event directly');
    }

    this.delay = delay || 0;
}

module.exports = Event;

/**
 * Decode an event from its MIDI representation
 *
 * @static
 * @param {Buffer} buf Buffer to decode
 * @throws {MIDIDecodeError} If the event is not recognized
 * @return {MetaEvent|ChannelEvent|SysexEvent} Decoded event
 */
Event.decode = function (buf) {
    var delay, status, event;

    buffer.start(buf);
    delay = new VarInt().decode(buf);
    status = buffer.readUIntLE(buf, 1);

    if (status === 0xFF) {
        event = MetaEvent._decodeInternal(buf, delay);
    } else if (status === 0xF0 || status === 0xF7) {
        event = SysexEvent._decodeInternal(buf, delay, status & 0xF);
    } else if (status >= 0x80 && status < 0xF0) {
        event = ChannelEvent._decodeInternal(buf, delay, status >> 4, status & 0xF);
    } else {
        throw new error.MIDIDecodeError(
            'Unknown status type: ' + hex.format(status)
        );
    }

    buffer.end(buf);
    return event;
};

/**
 * Decode this event internal's part (specific to
 * each type of event)
 *
 * @private
 * @static
 * @param {Buffer} buf Buffer to decode
 * @param {number} delay Event delay
 * @return {Event} Decoded event
 */
Event._decodeInternal = function () {
    throw new Error('_decodeInternal() not implemented');
};

/**
 * Encode this event to its MIDI representation
 *
 * @return {Buffer} Buffer of MIDI event bytes
 */
Event.prototype.encode = function () {
    var delay, result, data;

    delay = new VarInt(this.delay).encode();
    data = this._encodeInternal();

    result = new Buffer(data.length + delay.length);
    buffer.start(result);

    buffer.copy(result, delay);
    buffer.copy(result, data);

    buffer.end(result);
    return result;
};

/**
 * Encode this event internal's part (specific to
 * each type of event)
 *
 * @private
 * @return {Buffer} Buffer of MIDI event bytes
 */
Event.prototype._encodeInternal = function () {
    throw new Error('_encodeInternal() not implemented');
};
