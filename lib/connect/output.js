'use strict';

var error = require('../error');
var ChannelEvent = require('../file').File.ChannelEvent;
var encodeChannelEvent = require('../file/parser/event').encodeChannelEvent;

/**
 * Construct a new Output
 *
 * @class Output
 * @classdesc An output device to which we can send MIDI events
 *
 * @param {MIDIOutput} native Native MIDI output
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
 * @param {module:midijs/lib/file/event~ChannelEvent}
 * event MIDI event to send
 * @throws {module:midijs/lib/error~MIDIInvalidArgument}
 * Not a valid channel event
 * @return {null}
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
