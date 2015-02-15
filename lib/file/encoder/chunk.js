/**
 * @private
 * @module midijs/lib/file/parser/chunk
 */

'use strict';

var buffer = require('buffer');
var BufferCursor = require('buffercursor');

/**
 * Encode a MIDI chunk
 *
 * @param {String} type - Chunk type
 * @param {Buffer} data - Chunk data
 * @return {Buffer} Encoded chunk
 */
function encodeChunk(type, data) {
    var cursor = new BufferCursor(new buffer.Buffer(
        buffer.Buffer.byteLength(type) + 4 + data.length
    ));
    
    cursor.write(type);
    cursor.writeUInt32BE(data.length);
    cursor.copy(data);
    
    return cursor.buffer;
}

exports.encodeChunk = encodeChunk;
