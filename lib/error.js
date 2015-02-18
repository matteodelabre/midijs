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
 * @property {'MIDIParserError'} name - Error name
 * @property {*} actual - Actual value
 * @property {*} expected - Expected value
 * @property {?Number} byte - The byte at which the error occured
 * @property {String} message - Error message
 */
function MIDIParserError(actual, expected, byte) {
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

util.inherits(MIDIParserError, Error);
exports.MIDIParserError = MIDIParserError;

/**
 * An error that occured while encoding a MIDI file
 *
 * @constructor
 * @extends Error
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @property {'MIDIEncoderError'} name - Error name
 * @property {*} actual - Actual value
 * @property {*} expected - Expected value
 * @property {String} message - Error message
 */
function MIDIEncoderError(actual, expected) {
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

util.inherits(MIDIEncoderError, Error);
exports.MIDIEncoderError = MIDIEncoderError;

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

/**
 * Generic invalid argument error
 *
 * @constructor
 * @extends Error
 * @param {String} message - Error message
 * @property {'MIDIInvalidArgument'} name - Error name
 * @property {String} message - Error message
 */
function MIDIInvalidArgument(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    
    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDIInvalidArgument, Error);
exports.MIDIInvalidArgument = MIDIInvalidArgument;
