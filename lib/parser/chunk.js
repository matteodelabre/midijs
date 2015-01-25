/*jslint node:true, browser:true, bitwise:true */

'use strict';

var util = require('util');
var Event = require('./event');

/**
 * ChunkHeader
 *
 * Parse a MIDI header chunk
 *
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function ChunkHeader(cursor) {
    var timeDivision;
    
    this.fileType = cursor.readUInt16BE();
    this.trackCount = cursor.readUInt16BE();
    timeDivision = cursor.readUInt16BE();
    
    if ((timeDivision & 0x80) === 0) {
        this.ticksPerBeat = timeDivision & 0x7F;
    } else {
        throw new Error('Expressing time in SMTPE format is not supported');
    }
}

/**
 * ChunkTrack
 *
 * Parse a MIDI track chunk
 *
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function ChunkTrack(cursor) {
    var events = [], event, lastType = null;
    
    while (!cursor.eof()) {
        event = new Event(lastType, cursor);
        lastType = event.type;
        
        events.push(event);
    }

    this.events = events;
}

/**
 * Chunk
 *
 * Parse a MIDI chunk
 *
 * @private
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function Chunk(cursor) {
    var type, size, data, result;
    
    type = cursor.toString('ascii', 4);
    size = cursor.readUInt32BE();
    data = cursor.slice(size);
    
    if (type === 'MThd') {
        result = new ChunkHeader(data);
    } else if (type === 'MTrk') {
        result = new ChunkTrack(data);
    } else {
        throw new Error('Unknown chunk type "' + type + '"');
    }
    
    result.type = type;
    result.size = size;
    
    return result;
}

module.exports = Chunk;