'use strict';

var util = require('util');

var Port = require('./port').Port;
var ChannelEvent = require('../file').File.ChannelEvent;
var error = require('../error');
var encodeChannelEvent = require('../file/encoder/event').encodeChannelEvent;

/**
 * Construct a new Output
 *
 * @class Output
 * @extends Port
 * @classdesc An output device to which we can send MIDI events
 *
 * @inheritdoc
 * @param {function} send To send messages to the output
 */
function Output(meta, send) {
    Port.call(this, meta);

    /**
     * @private
     * @prop {function} _send Reference to send messages to the output
     */
    this._send = send;
}

util.inherits(Output, Port);
exports.Output = Output;

/**
 * Send a MIDI event to the output
 *
 * @param {ChannelEvent} event MIDI channel event to send
 * @throws {MIDIInvalidArgument} If `event` is not a valid channel event
 * @return {null}
 */
Output.prototype.send = function (event) {
    if (!event instanceof ChannelEvent) {
        throw new error.MIDIInvalidArgument(
            'Expected a channel event to be sent'
        );
    }

    this._send(
        [].slice.call(encodeChannelEvent(event)),
        event.delay || 0
    );
};
