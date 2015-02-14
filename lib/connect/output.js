/**
 * @private
 * @module midijs/lib/connect/output
 */

'use strict';

var ChannelEvent = require('../file/event').ChannelEvent;

/**
 * Output wrapper
 *
 * Add helper methods to ease working with
 * native MIDI outputs.
 *
 * @constructor
 * @param {MIDIOutput} native - Native MIDI output to wrap
 * @property {MIDIOutput} native - Wrapped native MIDI output
 * @property {String} id - Output unique identifier
 * @property {String} manufacturer - Output manufacturer informations
 * @property {String} name - Output name
 * @property {String} version - Output version
 */
function Output(native) {
    this.native = native;
    
    this.id = native.id;
    this.manufacturer = native.manufacturer;
    this.name = native.name;
    this.version = native.version;
}

exports.Output = Output;

/**
 * Send a MIDI event to the output
 *
 * @param {module:midijs/lib/file/event~ChannelEvent} event
 * MIDI event to send
 * @return {void}
 */
Output.prototype.send = function (event) {
    var subtype = event.subtype, data = [],
        lsb, msb, value;
    
    data.push((subtype << 4) + event.channel);
    
    switch (subtype) {
    case ChannelEvent.TYPE.NOTE_ON:
    case ChannelEvent.TYPE.NOTE_OFF:
        data.push(event.note, event.velocity);
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        data.push(event.note, event.pressure);
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        data.push(event.controller, event.value);
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        data.push(event.program);
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        data.push(event.pressure);
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        value = event.value + 8192;
        lsb = value & 127;
        msb = value >> 7;
        
        data.push(lsb, msb);
        break;
    }
    
    this.native.send(data, event.delay || 0);
};
