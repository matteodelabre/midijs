/*jslint node:true, browser:true, bitwise:true */

'use strict';

var parseChunk = require('./chunk').parseChunk;
var Header = require('../header').Header;

/**
 * Parse a MIDI header chunk
 *
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function parseHeader(cursor) {
    var chunk, fileType, trackCount, timeDivision;
    
    chunk = parseChunk('MThd', cursor);
    fileType = chunk.readUInt16BE();
    trackCount = chunk.readUInt16BE();

    timeDivision = chunk.readUInt16BE();

    if ((timeDivision & 0x8000) === 0) {
        timeDivision = timeDivision & 0x7FFF;
    } else {
        throw new Error('Expressing time in SMTPE format not supported');
    }
    
    return new Header(fileType, trackCount, timeDivision);
}

exports.parseHeader = parseHeader;
