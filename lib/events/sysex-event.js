'use strict';

var util = require('util');
var Event = require('./event');

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
 * @param {Buffer} data Sysex data
 * @param {number} delay Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    this.type = type;
    this.data = data;
    Event.call(this, {}, {}, delay);
}

util.inherits(SysexEvent, Event);
module.exports = SysexEvent;
