'use strict';

/**
 * @overview List of errors that can be triggered
 * by this module
 */

var util = require('util');

/**
 * Consruct a new MalformedError
 *
 * @class MalformedError
 * @extends Error
 * @classdesc Thrown if we try to decode a malformed file
 *
 * @inheritdoc
 */
function MalformedError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(MalformedError, Error);
exports.MalformedError = MalformedError;
