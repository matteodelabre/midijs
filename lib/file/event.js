/*jslint node:true, browser:true */

'use strict';

var util = require('util');
var id = 0;

/**
 * Event
 *
 * Represent an abstract MIDI event
 *
 * @private
 * @param {specs: object}   Event details
 * @param {delay: int}      Event delay in ticks
 */
function Event(specs, delay) {
    var name;
    
    this.id = 'EVENT_' + id;
    this.delay = delay || 0;
    
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
 * @param {type: string}    Meta type
 * @param {specs: object}   Meta details
 * @param {delay: int}      Meta info delay in ticks
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
 * @param {type: string}    Sysex type
 * @param {data: Buffer}    Sysex data
 * @param {delay: int}      Sysex message delay in ticks
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
 * @param {type: string}    Channel event type
 * @param {channel: int}    Channel ID to which the event applies
 * @param {specs: object}   Event details
 * @param {delay: int}      Event delay in ticks
 */
function ChannelEvent(type, channel, specs, delay) {
    this.type = type;
    this.channel = channel;
    Event.call(this, exports.TYPE_CHANNEL, specs, delay);
}

util.inherits(ChannelEvent, Event);
exports.ChannelEvent = ChannelEvent;