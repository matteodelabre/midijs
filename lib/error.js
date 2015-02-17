/**
 * @module midijs/lib/error
 */

'use strict';

var util = require('util');

/**
 * Format an argument to be displayed in the error message
 *
 * @private
 * @param {*} arg - Argument to format
 * @return {String} Formatted argument
 */
function format(arg) {
    if (typeof arg === 'number') {
        return '0x' + arg.toString(16).toUpperCase();
    }
    
    if (typeof arg === 'string') {
        return '"' + arg + '"';
    }
    
    return arg.toString();
}

/**
 * An error that occured while parsing a MIDI file
 *
 * @constructor
 * @extends Error
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @param {?Number} byte - The byte at which the error occured
 * @property {'MIDIFileParserError'} name - Error name
 * @property {*} actual - Actual value
 * @property {*} expected - Expected value
 * @property {?Number} byte - The byte at which the error occured
 * @property {String} message - Error message
 */
function MIDIFileParserError(actual, expected, byte) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    
    this.name = this.constructor.name;
    this.actual = actual;
    this.expected = expected;
    
    actual = format(actual);
    expected = format(expected);
    
    this.message = 'MIDI parsing error: expected ' +
        expected + ' but found ' + actual;
    
    if (byte !== undefined) {
        this.byte = byte;
        this.message += ' (at byte ' + byte + ')';
    }
}

util.inherits(MIDIFileParserError, Error);
exports.MIDIFileParserError = MIDIFileParserError;

/**
 * An error that occured while encoding a MIDI file
 *
 * @constructor
 * @extends Error
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @property {'MIDIFileEncoderError'} name - Error name
 * @property {*} actual - Actual value
 * @property {*} expected - Expected value
 * @property {String} message - Error message
 */
function MIDIFileEncoderError(actual, expected) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    
    this.name = this.constructor.name;
    this.actual = actual;
    this.expected = expected;
    
    actual = format(actual);
    expected = format(expected);
    
    this.message = 'MIDI encoding error: expected ' +
        expected + ' but found ' + actual;
}

util.inherits(MIDIFileEncoderError, Error);
exports.MIDIFileEncoderError = MIDIFileEncoderError;

/**
 * Thrown if an event is malformed
 *
 * @constructor
 * @extends Error
 * @param {String} message - Error message
 * @property {'MIDIInvalidEventError'} name - Error name
 * @property {String} message - Error message
 */
function MIDIInvalidEventError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    
    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDIInvalidEventError, Error);
exports.MIDIInvalidEventError = MIDIInvalidEventError;
