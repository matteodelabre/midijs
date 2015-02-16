/**
 * @private
 * @module midijs/lib/file/parser/header
 */

'use strict';

var encodeChunk = require('./chunk').encodeChunk;
var buffer = require('buffer');
var BufferCursor = require('buffercursor');

/**
 * Encode a MIDI header chunk
 *
 * @param {module:midijs/lib/file/header~Header} header - Header to encode
 * @return {Buffer} Encoded header
 */
function encodeHeader(header) {
    var cursor = new BufferCursor(new buffer.Buffer(6));
    
    cursor.writeUInt16BE(header.getFileType());
    cursor.writeUInt16BE(header._trackCount);
    cursor.writeUInt16BE(header.getTicksPerBeat() & 0x7FFF);
    
    return encodeChunk('MThd', cursor.buffer);
}

exports.encodeHeader = encodeHeader;
