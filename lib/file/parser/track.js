/*jslint node:true, browser:true */

'use strict';

var parseChunk = require('./chunk').parseChunk;
var parseEvent = require('./event').parseEvent;
var Track = require('../track').Track;

/**
 * Parse a MIDI track chunk
 *
 * @param {cursor: BufferCursor}  Buffer to parse
 */
function parseTrack(cursor) {
    var chunk, events = [];
    
    chunk = parseChunk(cursor);
    
    if (chunk.type !== 'MTrk') {
        throw new Error(
            'Invalid MIDI file: unexpected "' + chunk.type + '" chunk, ' +
                'expected track chunk.'
        );
    }

    while (!cursor.eof()) {
        events.push(parseEvent(cursor));
    }
    
    return new Track(events);
}

exports.parseTrack = parseTrack;