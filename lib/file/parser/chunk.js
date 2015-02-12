'use strict';

/**
 * Parse a MIDI chunk
 *
 * @param {String} expected - Expected type
 * @param {BufferCursor} cursor - Buffer to parse
 * @exception {Error} Type expectation failed
 * @return {BufferCursor} Chunk data
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
