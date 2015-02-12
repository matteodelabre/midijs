'use strict';

var util = require('util');
var id = 0;

/**
 * Event
 *
 * Represent an abstract MIDI event
 *
 * @private
 * @abstract
 * @constructor
 * @param {Object} specs -  Event details
 * @param {Number} delay - Event delay in ticks
 */
function Event(specs, delay) {
    var name;
    
    this.id = 'EVENT_' + id;
    this.delay = delay || 0;
    specs = specs || {};
    
    for (name in specs) {
        if (specs.hasOwnProperty(name) && !this.hasOwnProperty(name)) {
            this[name] = specs[name];
        }
    }
    
    id += 1;
}

/**
 * MetaEvent
 *
 * Represent a meta MIDI event. This type of event can only
 * be found in Standard MIDI files and gives details about the file.
 *
 * @constructor
 * @param {String} type - Meta type
 * @param {Object} specs - Meta details
 * @param {Number} delay - Meta info delay in ticks
 */
function MetaEvent(type, specs, delay) {
    this.type = type;
    Event.call(this, specs, delay);
}

util.inherits(MetaEvent, Event);
exports.MetaEvent = MetaEvent;

/**
 * SysexEvent
 *
 * Represent a sysex MIDI event. This type of event is
 * device-specific and requires a Sysex elevation to be
 * read from an input.
 *
 * @constructor
 * @param {String} type - Sysex type
 * @param {Buffer} data - Sysex data
 * @param {Number} delay - Sysex message delay in ticks
 */
function SysexEvent(type, data, delay) {
    this.type = type;
    this.data = data;
    Event.call(this, {}, delay);
}

util.inherits(SysexEvent, Event);
exports.SysexEvent = SysexEvent;

/**
 * ChannelEvent
 *
 * Represent a channel MIDI event. This type of event changes
 * the state of channels by setting notes on and off or
 * changing controllers values.
 *
 * @constructor
 * @param {String} type - Channel event type
 * @param {Number} channel - Channel ID to which the event applies
 * @param {Object} specs - Event details
 * @param {Number} delay - Event delay in ticks
 */
function ChannelEvent(type, channel, specs, delay) {
    this.type = type;
    this.channel = channel;
    Event.call(this, specs, delay);
}

util.inherits(ChannelEvent, Event);
exports.ChannelEvent = ChannelEvent;
