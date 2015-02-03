/*jslint node:true, browser:true, bitwise:true */

'use strict';

/**
 * Parse a MIDI chunk
 *
 * @param {expected: string}        Expected type
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function parseChunk(expected, cursor) {
    var type, length;
    
    type = cursor.toString('ascii', 4);
    length = cursor.readUInt32BE();
    
    if (type !== expected) {
        throw new Error(
            'Invalid MIDI file: unexpected "' + type + '" chunk, ' +
                'expected "' + expected + '" chunk.'
        );
    }
    
    return cursor.slice(length);
}

exports.parseChunk = parseChunk;