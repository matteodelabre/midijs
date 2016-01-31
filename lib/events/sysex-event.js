'use strict';


var MIDIBuffer = require('../util/buffer');
var selectConst = require('../util/select-const');

var vintLength = MIDIBuffer.getVarIntLength;

/**
 * @class SysexEvent
 * @classdesc A system exclusive MIDI event. This kind of event is
 * not formally defined by the specification and can hold any kind
 * of data. Its contents depends on the manufacturer, thus, this API
 * does not try to interpret them but only passes the data along
 *
 * @param {number} type Sysex type
 * @param {MIDIBuffer|Buffer|Array|*} data Event data
 * @param {number} [delay=0] Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    // you can use a string to represent a constant
    // e.g. "type 1" for SysexEvent.TYPE.TYPE_1
    if (typeof type === 'string') {
        type = selectConst(SysexEvent.TYPE, type);
    }

    if (type < 0 || type > 15) {
        type = SysexEvent.TYPE.TYPE_1;
    }

    this.type = type;
    this.delay = delay || 0;
    this.data = data || new Buffer(0);
}

module.exports = SysexEvent;

/**
 * Types of sysex events
 *
 * @readonly
 * @static
 * @enum {number}
 */
SysexEvent.TYPE = Object.freeze({
    TYPE_1: 0,
    TYPE_2: 7
});

/**
 * Decode given buffer of MIDI data to a sysex event
 *
 * @param {number} delay Event delay in ticks
 * @param {number} status Event status byte
 * @param {MIDIBuffer} buf Data to decode
 * @return {ChannelEvent} Decoded event
 */
SysexEvent.decode = function (delay, status, buf) {
    var type, data, length;

    type = status & 0xF;
    length = buf.readVarInt();
    data = buf.slice(length).toBuffer();

    return new SysexEvent(type, data, delay);
};

/**
 * Encode this event to a buffer in the MIDI format
 * (without delay bytes, use Context for full encoding)
 *
 * @return {MIDIBuffer} Event's binary representation
 */
SysexEvent.prototype.encode = function () {
    var result, data = new MIDIBuffer(this.data),
        length = data.getLength();

    result = new MIDIBuffer(1 + vintLength(length) + length);

    result.writeUIntLE(8, 0xF0 | this.type);
    result.writeVarInt(length);
    result.copy(data);

    return result;
};
