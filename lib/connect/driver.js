'use strict';

var Output = require('./output').Output;
var Input = require('./input').Input;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Driver wrapper
 *
 * Use node event emitting API and emit event objects
 * rather than raw data
 *
 * @constructor
 * @param {MIDIAccess} native - Native MIDI access to wrap
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

Driver.prototype.setInput = function (input) {
    if (this.input !== null) {
        this.input.removeListener('event', this.transmitMIDIEvent);
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
    this.input.on('event', this.transmitMIDIEvent);
};

/**
 * Transmit events from default input
 *
 * @param {EventChannel} event - Event to be transmitted
 * @return {void}
 */
Driver.prototype.transmitMIDIEvent = function (event) {
    this.emit('event', event);
};

/**
 * Select output as default output
 *
 * @param {String|Output|MIDIOutput} output - Output id or instance
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
 * @param {EventChannel} event - Event to be sent
 * @return {void}
 */
Driver.prototype.send = function (event) {
    if (this.output !== null) {
        this.output.send(event);
    }
};
