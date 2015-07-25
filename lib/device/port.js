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
 * @param {number} meta.id Unique identifier for this port
 * @param {string} meta.name Descriptive name of this port
 * @param {string} [meta.manufacturer] Port manufacturer
 * @param {string} [meta.version] Device version
 */
function Port(meta) {
    EventEmitter.call(this);

    /**
     * @prop {number} Input#id Unique identifer for this port
     */
    this.id = meta.id;

    /**
     * @prop {string} Input#name Descriptive name of this port
     */
    this.name = meta.name;

    /**
     * @prop {string|undefined} Input#manufacturer Port manufacturer
     */
    this.manufacturer = meta.manufacturer;

    /**
     * @prop {string|undefined} Input#version Device version
     */
    this.version = meta.version;
}

util.inherits(Port, EventEmitter);
exports.Port = Port;
