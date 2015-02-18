/**
 * @module midijs
 */

'use strict';

/**
 * Parse and encode MIDI data<br />
 * {@link module:midijs/lib/file}
 */
exports.File = require('./lib/file').File;

/**
 * Establish a connection to the MIDI driver<br />
 * {@link module:midijs/lib/connect}
 */
exports.connect = require('./lib/connect').connect;

/**
 * List of programs and instruments defined by the General MIDI standard<br />
 * {@link module:midijs/lib/gm}
 */
exports.gm = require('./lib/gm');

/**
 * Constructors of the errors that can be thrown by this module<br />
 * {@link module:midijs/lib/error}
 */
exports.error = require('./lib/error');
