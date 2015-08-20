'use strict';

var buffer = require('../util/buffer');
var MalformedError = require('../util/errors').MalformedError;
var varint = require('./var-int');
var MetaEvent, SysexEvent, ChannelEvent;

/**
 * @class Event
 * @abstract
 * @classdesc All kinds of MIDI events extend this class that provides
 * common features. As such, you should not instanciate it directly, but use
 * child classes instead: {@link ChannelEvent}, {@link SysexEvent} and
 * {@link MetaEvent}.
 *
 * @param {number} [delay=0] Event delay in ticks
 */
function Event(delay) {
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
 * to use the running status : we will use the previous status
 * byte if it is not defined. It is recommended that you use this
 * option to be compatible with all kinds of inputs. Given object
 * will be modified by reference so that
 * the previous status is saved, thus this object should not
 * change between sequential event encodings
 * @param {number} [givenDelay] If you already know the delay property
 * for this event, pass it here and we will not try to read it from
 * the buffer
 * @throws {MIDIDecodeError} If the bytes sequence is invalid
 * @return {MetaEvent|ChannelEvent|SysexEvent} Decoded event
 */
Event.decode = function (buf, runningStatus, givenDelay) {
    var delay, status, event;

    buffer.start(buf);

    if (isNaN(givenDelay)) {
        delay = varint.decode(buf);
    } else {
        delay = givenDelay;
    }

    status = buffer.readUIntLE(buf, 1);

    if (typeof runningStatus === 'object' && runningStatus !== null) {
        // if the most-significant byte is not set,
        // that means we have to reuse the status from
        // the previous event
        if ((status & 0x80) === 0) {
            if (runningStatus.previous === undefined) {
                throw new MalformedError(
                    'File byte instructs to use previous status for ' +
                    'current event, but it is the first event in track'
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
        throw new MalformedError(
            'Current event has a status that is neither a ' +
            'meta, sysex nor channel event (0x' + status.toString(16) + ')'
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
Event._decodeInternal = null;

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

    delay = varint.encode(this.delay);
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
Event.prototype._encodeInternal = null;
