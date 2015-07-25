'use strict';

var buffer = require('buffer');
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
 * @param {Object} meta Metadata about this input
 * @param {EventEmitter} emitter Emitter for each message from the input
 */
function Input(meta, emitter) {
    Port.call(this, meta);

    emitter.on('message', function (event) {
        var data, type;

        data = new BufferCursor(new buffer.Buffer(event.data));
        type = data.readUInt8();

        /**
         * MIDI event received from the input
         *
         * @event Input#event
         * @type {ChannelEvent}
         */
        this.emit('event', parseChannelEvent(
            event.receivedTime,
            type >> 4,
            type & 0xF,
            data
        ));
    }.bind(this));
}

util.inherits(Input, Port);
exports.Input = Input;
