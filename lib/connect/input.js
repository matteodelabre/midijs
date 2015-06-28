'use strict';

var buffer = require('buffer');
var BufferCursor = require('buffercursor');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var parseChannelEvent = require('../file/parser/event').parseChannelEvent;

/**
 * Construct a new Input
 *
 * @class Input
 * @classdesc An input device from which we can receive MIDI events
 *
 * @param {MIDIInput} native Native MIDI input
 */
function Input(native) {
    EventEmitter.call(this);
    this.native = native;

    this.id = native.id;
    this.manufacturer = native.manufacturer;
    this.name = native.name;
    this.version = native.version;

    native.onmidimessage = function (event) {
        var data, type, object;

        data = new BufferCursor(new buffer.Buffer(event.data));
        type = data.readUInt8();

        object = parseChannelEvent(
            event.receivedTime,
            type >> 4,
            type & 0xF,
            data
        );

        this.emit('event', object);
    }.bind(this);
}

util.inherits(Input, EventEmitter);
exports.Input = Input;
