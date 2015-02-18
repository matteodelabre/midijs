/**
 * @private
 * @module midijs/lib/connect/output
 */

'use strict';

var error = require('../error');
var ChannelEvent = require('../file').File.ChannelEvent;
var encodeChannelEvent = require('../file/parser/event').encodeChannelEvent;

/**
 * MIDI output wrapper
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
 * @exception {module:midijs/lib/error~MIDIInvalidArgument}
 * Not a valid channel event
 * @return {void}
 */
Output.prototype.send = function (event) {
    var data;
    
    if (!event instanceof ChannelEvent) {
        throw new error.MIDIInvalidArgument(
            'Expected a channel event to be sent'
        );
    }
    
    data = encodeChannelEvent(event).data;
    
    this.native.send(
        [].slice.call(data),
        event.delay || 0
    );
};
