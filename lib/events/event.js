'use strict';

var buffer = require('../util/buffer');
var error = require('../util/error');
var VarInt = require('./var-int');
var MetaEvent, SysexEvent, ChannelEvent;

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

// include subclasses after Event definition
// so that they can extend us properly
MetaEvent = require('./meta-event');
SysexEvent = require('./sysex-event');
ChannelEvent = require('./channel-event');

/**
 * Decode an event from its MIDI representation
 *
 * @static
 * @param {Buffer} buf Buffer to decode
 * @param {Object} [runningStatus] Pass an empty object
 * to use the running status : will use the previous status
 * byte if it is not defined. It is recommended that you use this
 * option to be compatible with all kinds of inputs. Given object
 * will be modified by reference so that
 * the previous status is saved, thus this object should not be
 * changed between sequential event encodings
 * @throws {MIDIDecodeError} If the bytes sequence is invalid
 * @return {MetaEvent|ChannelEvent|SysexEvent} Decoded event
 */
Event.decode = function (buf, runningStatus) {
    var delay, status, event;

    buffer.start(buf);
    delay = new VarInt().decode(buf);
    status = buffer.readUIntLE(buf, 1);

    if (typeof runningStatus === 'object' && runningStatus !== null) {
        // if the most-significant byte is not set,
        // that means we have to reuse the status from
        // the previous event
        if ((status & 0x80) === 0) {
            if (runningStatus.previous === undefined) {
                throw new error.MIDIDecodeError(
                    'Undefined event status'
                );
            }

            status = runningStatus.previous;
            buffer.seek(buf, buffer.tell(buf) - 1);
        } else {
            runningStatus.previous = status;
        }
    }

    if (status === 0xFF) {
        event = MetaEvent._decodeInternal(buf, delay);
    } else if (status === 0xF0 || status === 0xF7) {
        event = SysexEvent._decodeInternal(buf, delay, status & 0xF);
    } else if (status >= 0x80 && status < 0xF0) {
        event = ChannelEvent._decodeInternal(buf, delay, status >> 4, status & 0xF);
    } else {
        throw new error.MIDIDecodeError(
            'Unknown status type: ' + status
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
 * @param {Object} [runningStatus] Pass an empty object
 * to use the running status : will skip the status byte if it matches
 * the last one. Given object will be modified by reference so that
 * the previous status is saved, thus this object should not be
 * changed between sequential event encodings
 * @return {Buffer} Buffer of MIDI event bytes
 */
Event.prototype.encode = function (runningStatus) {
    var delay, result, data;

    delay = new VarInt(this.delay).encode();
    data = this._encodeInternal();

    if (typeof runningStatus === 'object' && runningStatus !== null) {
        // skip the status byte if this status is the same as
        // the previous one - sysex events will reset running statuses
        if (this instanceof ChannelEvent) {
            if (runningStatus.previous === data[0]) {
                data = data.slice(1);
            } else {
                runningStatus.previous = data[0];
            }
        } else if (this instanceof SysexEvent) {
            delete runningStatus.previous;
        }
    }

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
