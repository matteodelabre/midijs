'use strict';

var util = require('util');

/**
 * Format an argument to be displayed in the error message
 *
 * @private
 * @param {*} arg Argument to format
 * @return {string} Formatted argument
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
 * Consruct a new MIDIParserError
 *
 * @class MIDIParserError
 * @extends Error
 * @classdesc An error that occured while parsing a MIDI file
 *
 * @param {*} actual Actual value
 * @param {*} expected Expected value
 * @param {number} [byte] The byte at which the error occured
 */
function MIDIParserError(actual, expected, byte) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.actual = actual;
    this.expected = expected;

    actual = format(actual);
    expected = format(expected);

    this.message = 'Invalid MIDI file: expected ' +
        expected + ' but found ' + actual;

    if (byte !== undefined) {
        this.byte = byte;
        this.message += ' (at byte ' + byte + ')';
    }
}

util.inherits(MIDIParserError, Error);
exports.MIDIParserError = MIDIParserError;

/**
 * Construct a new MIDIEncoderError
 *
 * @class MIDIEncoderError
 * @extends Error
 * @classdesc An error that occured while encoding a MIDI file
 *
 * @param {*} actual Actual value
 * @param {*} expected Expected value
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
 * Construct a new MIDIInvalidEventError
 *
 * @class MIDIInvalidEventError
 * @extends Error
 * @classdesc An error that occured if an event was malformed
 *
 * @param {string} message Error message
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
 * Construct a new MIDIInvalidArgument
 *
 * @class MIDIInvalidArgument
 * @extends Error
 * @classdesc Generic invalid argument error
 *
 * @param {string} message Error message
 */
function MIDIInvalidArgument(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDIInvalidArgument, Error);
exports.MIDIInvalidArgument = MIDIInvalidArgument;

/**
 * Construct a new MIDINotMIDIError
 *
 * @class MIDINotMIDIError
 * @extends Error
 * @classdesc An error that indicates that the file is not a MIDI file
 */
function MIDINotMIDIError() {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = 'Not a valid MIDI file';
}

util.inherits(MIDINotMIDIError, Error);
exports.MIDINotMIDIError = MIDINotMIDIError;

/**
 * Construct a new MIDINotSupportedError
 *
 * @class MIDINotSupportedError
 * @extends Error
 * @classdesc An error that indicates that you tried to use
 * a MIDI feature that is not supported by this library
 *
 * @param {string} message Error message
 */
function MIDINotSupportedError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDINotSupportedError, Error);
exports.MIDINotSupportedError = MIDINotSupportedError;
