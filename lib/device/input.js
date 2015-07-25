'use strict';

var BufferCursor = require('buffercursor');
var util = require('util');

var Port = require('./port').Port;
var parseChannelEvent = require('../file/parser/event').parseChannelEvent;

/**
 * Construct a new Input
 *
 * @class Input
 * @extends Port
 * @classdesc An input device from which we can receive MIDI events
 *
 * @inheritdoc
 */
function Input(meta) {
    Port.call(this, meta);
}

/**
 * Make the input receive an event
 *
 * @private
 * @param {Array} data Native MIDI data
 * @param {number} delta Received delta time
 * @event Input#event
 * @return {null}
 */
Input.prototype._receive = function (data, delta) {
    var type;

    data = new BufferCursor(new Buffer(event.data));
    type = data.readUInt8();

    this.emit('event', parseChannelEvent(delta, type >> 4, type & 0xF, data));
};

util.inherits(Input, Port);
exports.Input = Input;
