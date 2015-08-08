'use strict';

var util = require('util');

/**
 * Consruct a new MIDIDecodeError
 *
 * @class MIDIDecodeError
 * @extends Error
 * @classdesc An error that occured while decoding MIDI bytes
 *
 * @inheritdoc
 */
function MIDIDecodeError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDIDecodeError, Error);
exports.MIDIDecodeError = MIDIDecodeError;

/**
 * Construct a new MIDIEncodeError
 *
 * @class MIDIEncodeError
 * @extends Error
 * @classdesc An error that occured while encoding a MIDI object
 *
 * @inheritdoc
 */
function MIDIEncodeError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDIEncodeError, Error);
exports.MIDIEncodeError = MIDIEncodeError;

/**
 * Construct a new MIDINotSupportedError
 *
 * @class MIDINotSupportedError
 * @extends Error
 * @classdesc An error that indicates that you tried to use
 * a MIDI feature that is not supported by this library
 *
 * @inheritdoc
 */
function MIDINotSupportedError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MIDINotSupportedError, Error);
exports.MIDINotSupportedError = MIDINotSupportedError;
