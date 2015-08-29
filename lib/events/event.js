'use strict';

var MIDIBuffer = require('../util/buffer');
var MalformedError = require('../util/errors').MalformedError;
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
 * Decode a buffer or array of MIDI bytes to an Event
 * instance (MetaEvent, SysexEvent or ChannelEvent)
 * based on its type
 *
 * @static
 * @param {MIDIBuffer|Buffer|Array|*} input Data to decode
 * @param {Object} [runningStatus] Pass an empty object
 * to use the running status : we will use the previous status
 * byte if it is not defined. It is recommended that you use this
 * option to be compatible with all kinds of inputs. Given object
 * will be modified by reference so that
 * the previous status is saved, thus this object should not
 * change between sequential event encodings
 * @param {bool} [noDelay=false] Pass true if given data doesn't contain delay
 * @throws {MalformedError} If the data couldn't be decoded
 * @return {MetaEvent|ChannelEvent|SysexEvent} Decoded event
 */
Event.decode = function (input, runningStatus, noDelay) {
    var delay, status, event, buf = new MIDIBuffer(input);

    if (noDelay) {
        delay = 0;
    } else {
        delay = buf.readVarInt();
    }

    status = buf.readUIntLE(8);

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
            buf.seek(buf.tell() - 1);
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
 * @param {bool} [noDelay=false] Pass true if you don't want delay byte
 * @return {MIDIBuffer} Buffer of MIDI event bytes
 */
Event.prototype.encode = function (runningStatus, noDelay) {
    var result, data, status;

    data = this._encodeInternal();
    status = data.toBuffer()[0];

    if (typeof runningStatus === 'object' && runningStatus !== null) {
        // skip the status byte if this status is the same as
        // the previous one - sysex events will reset running statuses
        if (this instanceof ChannelEvent) {
            if (runningStatus.previous === status) {
                data.seek(1);
                data = data.slice();
            } else {
                runningStatus.previous = status;
            }
        } else if (this instanceof SysexEvent) {
            delete runningStatus.previous;
        }
    }

    if (noDelay) {
        result = new MIDIBuffer(data.getLength());
    } else {
        result = new MIDIBuffer(
            data.getLength() + MIDIBuffer.getVarIntLength(this.delay)
        );

        result.writeVarInt(this.delay);
    }

    result.copy(data);
    return result;
};

/**
 * Encode this event internal's part (specific to
 * each type of event)
 *
 * @private
 * @return {MIDIBuffer} Buffer of MIDI event bytes
 */
Event.prototype._encodeInternal = null;
