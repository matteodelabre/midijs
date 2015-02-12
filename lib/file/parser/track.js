'use strict';

var parseChunk = require('./chunk').parseChunk;
var parseEvent = require('./event').parseEvent;
var Track = require('../track').Track;

/**
 * Parse a MIDI track chunk
 *
 * @param {BufferCursor} cursor - Buffer to parse
 * @return {Track} Parsed track
 */
function parseTrack(cursor) {
    var chunk, events = [];
    
    chunk = parseChunk('MTrk', cursor);
    
    while (!chunk.eof()) {
        events.push(parseEvent(chunk));
    }
    
    return new Track(events);
}

exports.parseTrack = parseTrack;
