/**
 * @private
 * @module midijs/lib/connect/input
 */

'use strict';

var buffer = require('buffer');
var BufferCursor = require('buffercursor');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var ChannelEvent = require('../file').File.ChannelEvent;

/**
 * MIDI input wrapper
 *
 * @constructor
 * @param {MIDIInput} native - Native MIDI input to wrap
 * @property {MIDIInput} native - Wrapped native MIDI input
 * @property {String} id - Input unique identifier
 * @property {String} manufacturer - Input manufacturer informations
 * @property {String} name - Input name
 * @property {String} version - Input version
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
        
        object = new ChannelEvent(
            type >> 4,
            data,
            type & 0xF,
            event.receivedTime
        );
        
        this.emit('event', object);
    }.bind(this);
}

util.inherits(Input, EventEmitter);
exports.Input = Input;
