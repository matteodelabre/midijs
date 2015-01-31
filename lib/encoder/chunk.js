/*jslint node:true, browser:true, bitwise:true */

'use strict';

var util = require('util');
var Event = require('./event').Event;

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
    
    if ((timeDivision & 0x8000) === 0) {
        this.ticksPerBeat = timeDivision & 0x7FFF;
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
    var events = [];
    
    while (!cursor.eof()) {
        events.push(new Event(cursor));
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
    var type, length, result;
    
    type = cursor.toString('ascii', 4);
    length = cursor.readUInt32BE();
    
    if (type === 'MThd') {
        result = new ChunkHeader(cursor.slice(length));
    } else if (type === 'MTrk') {
        result = new ChunkTrack(cursor.slice(length));
    } else {
        throw new Error('Invalid MIDI chunk: type "' + type + '"');
    }
    
    result.type = type;
    result.length = length;
    
    return result;
}

exports.Chunk = Chunk;