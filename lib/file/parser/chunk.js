/**
 * @private
 * @module midijs/lib/file/parser/chunk
 */

'use strict';

var error = require('../../error');

/**
 * Parse a MIDI chunk
 *
 * @param {String} expected - Expected type
 * @param {module:buffercursor} cursor - Buffer to parse
 * @exception {module:midijs/lib/error~MIDIParserError}
 * Type expectation failed
 * @return {module:buffercursor} Chunk data
 */
function parseChunk(expected, cursor) {
    var type, length;
    
    type = cursor.toString('ascii', 4);
    length = cursor.readUInt32BE();
    
    if (type !== expected) {
        throw new error.MIDIParserError(
            type,
            expected,
            cursor.tell()
        );
    }
    
    return cursor.slice(length);
}

exports.parseChunk = parseChunk;
