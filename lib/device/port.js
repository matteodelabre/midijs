'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Construct a new Port
 *
 * @class Input
 * @abstract
 * @extends EventEmitter
 * @classdesc A generic class for MIDI inputs and outputs
 *
 * @param {Object} meta Metadata about the port
 */
function Port(meta) {
    EventEmitter.call(this);

    /**
     * @prop {number} Input#id Unique identifer for this input
     */
    this.id = meta.id;

    /**
     * @prop {string} Input#name Descriptive name of this input
     */
    this.name = meta.name;

    /**
     * @prop {string|undefined} Input#manufacturer Manufacturer of this input
     */
    this.manufacturer = meta.manufacturer;

    /**
     * @prop {string|undefined} Input#version Device version
     */
    this.version = meta.version;
}

util.inherits(Port, EventEmitter);
exports.Port = Port;
