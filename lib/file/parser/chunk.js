/*jslint node:true, browser:true, bitwise:true */

'use strict';

/**
 * Parse a MIDI chunk
 *
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function parseChunk(cursor) {
    var type, length;
    
    type = cursor.toString('ascii', 4);
    length = cursor.readUInt32BE();
    
    return {
        type: type,
        data: cursor.slice(length)
    };
}

exports.parseChunk = parseChunk;