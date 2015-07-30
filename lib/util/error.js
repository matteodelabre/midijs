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
 * Construct a new MIDIInvalidEventError
 *
 * @class MIDIInvalidEventError
 * @extends Error
 * @classdesc An error that occured if an event was malformed
 *
 * @inheritdoc
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
