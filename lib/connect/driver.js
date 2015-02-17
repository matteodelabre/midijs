/**
 * @private
 * @module midijs/lib/connect/driver
 */

'use strict';

var Output = require('./output').Output;
var Input = require('./input').Input;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * MIDI access wrapper
 *
 * @constructor
 * @extends events.EventEmitter
 * @param {MIDIAccess} native - Native MIDI access to wrap
 * @property {MIDIAccess} native - Wrapped native MIDI access
 * @property {Array<module:midijs/lib/connect/output~Output>} outputs
 * List of available outputs
 * @property {Array<module:midijs/lib/connect/input~Input>} inputs
 * List of available inputs
 * @property {?module:midijs/lib/connect/output~Output} output
 * Current default output
 * @property {?module:midijs/lib/connect/input~Input} input
 * Current default input
 */
function Driver(native) {
    var outputs = [], inputs = [], length, i;
    
    EventEmitter.call(this);
    this.native = native;
    
    length = native.outputs.size;

    for (i = 0; i < length; i += 1) {
        outputs[i] = new Output(native.outputs.get(i));
    }

    length = native.inputs.size;

    for (i = 0; i < length; i += 1) {
        inputs[i] = new Input(native.inputs.get(i));
    }
    
    this.outputs = outputs;
    this.output = null;
    this.inputs = inputs;
    this.input = null;
    
    native.onconnect = function (event) {
        var port = event.port;
        
        if (port.type === 'input') {
            port = new Input(port);
            this.inputs.push(port);
        } else {
            port = new Output(port);
            this.outputs.push(port);
        }
        
        this.emit('connect', port);
    }.bind(this);
    
    native.ondisconnect = function (event) {
        var port = event.port;
        
        if (port.type === 'input') {
            port = new Input(port);
            this.inputs = this.inputs.filter(function (input) {
                return (input.id !== port.id);
            });
        } else {
            port = new Output(port);
            this.outputs = this.outputs.filter(function (output) {
                return (output.id !== port.id);
            });
        }
        
        this.emit('disconnect', port);
    }.bind(this);
}

exports.Driver = Driver;
util.inherits(Driver, EventEmitter);

/**
 * Select input as default input
 * (will start listening to events emitted by the given input
 * and stop listening to the previous default input if there
 * was one)
 *
 * @param {module:midijs/lib/connect/input~Input|MIDIInput|String} input
 * Input id or instance
 * @return {void}
 */
Driver.prototype.setInput = function (input) {
    if (this.input !== null) {
        this.input.removeListener('event', this._transmitMIDIEvent);
    }
    
    if (!input) {
        this.input = null;
        return;
    }
    
    if (typeof input === 'string') {
        input = this.inputs.find(function (element) {
            return (element.id === input);
        });
    } else if (!input instanceof Input) {
        input = new Input(input);
    }
    
    this.input = input;
    this.input.on('event', this._transmitMIDIEvent);
};

/**
 * Transmit events from default input
 *
 * @private
 * @param {module:midijs/lib/file/event~ChannelEvent} event
 * Event to be transmitted
 * @return {void}
 */
Driver.prototype._transmitMIDIEvent = function (event) {
    this.emit('event', event);
};

/**
 * Select output as default output
 *
 * @param {module:midijs/lib/connect/output~Output|MIDIOutput|String} output
 * Output id or instance
 * @return {void}
 */
Driver.prototype.setOutput = function (output) {
    if (!output) {
        this.output = null;
        return;
    }
    
    if (typeof output === 'number') {
        output = this.outputs.find(function (element) {
            return (element.id === output);
        });
    } else if (!output instanceof Output) {
        output = new Output(output);
    }
    
    this.output = output;
};

/**
 * Send a MIDI event on default output
 *
 * @param {module:midijs/lib/file/event~ChannelEvent} event
 * Event to be sent
 * @return {void}
 */
Driver.prototype.send = function (event) {
    if (this.output !== null) {
        this.output.send(event);
    }
};
