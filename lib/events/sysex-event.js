'use strict';

var util = require('util');

var buffer = require('../buffer');
var VarInt = require('./util/var-int');
var Event = require('./util/event');

/**
 * Construct a SysexEvent
 *
 * @class SysexEvent
 * @extends Event
 * @classdesc A system exclusive MIDI event. This kind of event is
 * not formally defined by the specification and can hold any kind
 * of data. Its contents depends on the manufacturer, thus, this API
 * does not try to interpret them but only passes the data along
 *
 * @param {number} type Sysex type
 * @param {Buffer} data Event data
 * @param {number} delay Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    Event.call(this, delay);

    this.type = type;
    this.data = data;
}

util.inherits(SysexEvent, Event);
module.exports = SysexEvent;

/**
 * @inheritdoc
 * @param {number} type Sysex type
 */
SysexEvent._decodeInternal = function (buf, delay, type) {
    var data, length;

    buffer.start(buf);
    length = VarInt.decode(buf);
    data = buffer.slice(buf, length);
    buffer.end(buf);

    return new SysexEvent(type, data, delay);
};

/**
 * @inheritdoc
 */
SysexEvent.prototype._encodeInternal = function () {
    var result, length;

    length = (new VarInt(this.data.length)).encode();
    result = new Buffer(this.data.length + 1 + length.length);
    buffer.start(result);

    buffer.writeUIntLE(result, 1, 0xF0 | this.type);
    buffer.copy(result, length);
    buffer.copy(result, this.data);

    buffer.end(result);
    return result;
};
