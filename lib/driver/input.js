/*jslint node:true, browser:true, bitwise:true */

'use strict';

var buffer = require('buffer');
var BufferCursor = require('buffercursor');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var EventChannel = require('../parser/event').EventChannel;

/**
 * Input wrapper
 *
 * Use node event emitting API and emit event objects
 * rather than raw data
 *
 * @param {native: MIDIInput}  Native MIDI input to wrap
 */
function Input(native) {
    EventEmitter.call(this);
    this.native = native;
    
    native.onmidimessage = function (event) {
        var data, type, object;
        
        data = new BufferCursor(new buffer.Buffer(event.data));
        type = data.readUInt8();
        
        object = new EventChannel(type >> 4, type & 0xF, data);
        object.delay = event.receivedTime || 0;
        
        this.emit('event', object);
    }.bind(this);
}

util.inherits(Input, EventEmitter);
exports.Input = Input;