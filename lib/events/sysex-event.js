'use strict';

var util = require('util');

var buffer = require('../util/buffer');
var selectConst = require('../util/select-const');
var varint = require('../util/var-int');
var Event = require('./event');

/**
 * @class SysexEvent
 * @extends Event
 * @classdesc A system exclusive MIDI event. This kind of event is
 * not formally defined by the specification and can hold any kind
 * of data. Its contents depends on the manufacturer, thus, this API
 * does not try to interpret them but only passes the data along
 *
 * @param {number} type Sysex type
 * @param {Buffer} data Event data
 * @param {number} [delay=0] Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    Event.call(this, delay);

    // you can use a string to represent a constant
    // e.g. "type 1" for SysexEvent.TYPE.TYPE_1
    if (typeof type === 'string') {
        type = selectConst(SysexEvent.TYPE, type);
    }

    if (type < 0 || type > 15) {
        type = SysexEvent.TYPE.TYPE_1;
    }

    this.type = type;
    this.data = data || new Buffer(0);
}

util.inherits(SysexEvent, Event);
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
 * @inheritdoc
 * @param {number} type Sysex type
 */
SysexEvent._decodeInternal = function (buf, delay, type) {
    var data, length;

    buffer.start(buf);
    length = varint.decode(buf);
    data = buffer.slice(buf, length);
    buffer.end(buf);

    return new SysexEvent(type, data, delay);
};

/**
 * @inheritdoc
 */
SysexEvent.prototype._encodeInternal = function () {
    var result, length;

    length = varint.encode(this.data.length);
    result = new Buffer(this.data.length + 1 + length.length);
    buffer.start(result);

    buffer.writeUIntLE(result, 1, 0xF0 | this.type);
    buffer.copy(result, length);
    buffer.copy(result, this.data);

    buffer.end(result);
    return result;
};
