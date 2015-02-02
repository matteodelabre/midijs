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
    
    chunk = parseChunk(cursor);
    
    if (chunk.type !== 'MThd') {
        throw new Error(
            'Invalid MIDI file: unexpected "' + chunk.type + '" chunk, ' +
                'expected header chunk.'
        );
    }
    
    fileType = chunk.data.readUInt16BE();
    trackCount = chunk.data.readUInt16BE();

    timeDivision = chunk.data.readUInt16BE();

    if ((timeDivision & 0x8000) === 0) {
        timeDivision = timeDivision & 0x7FFF;
    } else {
        throw new Error('Expressing time in SMTPE format not supported');
    }
    
    return new Header(fileType, trackCount, timeDivision);
}

exports.parseHeader = parseHeader;