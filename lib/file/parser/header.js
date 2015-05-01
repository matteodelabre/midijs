/**
 * @private
 * @module midijs/lib/file/parser/header
 */

'use strict';

var error = require('../../error');
var parseChunk = require('./chunk').parseChunk;
var Header = require('../header').Header;

/**
 * Parse a MIDI header chunk
 *
 * @param {module:buffercursor} cursor - Buffer to parse
 * @exception {module:midijs/lib/error~MIDINotMIDIError}
 * If the file is not a MIDI file
 * @exception {module:midijs/lib/error~MIDIParserError}
 * If time is expressed in unsupported SMPTE format
 * @return {module:midijs/lib/file/header~Header} Parsed header
 */
function parseHeader(cursor) {
    var chunk, fileType, trackCount, timeDivision;
    
    try {
        chunk = parseChunk('MThd', cursor);
    } catch (e) {
        if (e instanceof error.MIDIParserError) {
            throw new error.MIDINotMIDIError();
        }
    }
    fileType = chunk.readUInt16BE();
    trackCount = chunk.readUInt16BE();

    timeDivision = chunk.readUInt16BE();

    if ((timeDivision & 0x8000) === 0) {
        timeDivision = timeDivision & 0x7FFF;
    } else {
        throw new error.MIDINotSupportedError(
            'Expressing time in SMPTE format is not supported yet'
        );
    }
    
    return new Header(fileType, trackCount, timeDivision);
}

exports.parseHeader = parseHeader;
