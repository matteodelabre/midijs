/**
 * @private
 * @module midijs/lib/file/parser/track
 */

'use strict';

var parseChunk = require('./chunk').parseChunk;
var parseEvent = require('./event').parseEvent;
var Track = require('../track').Track;

/**
 * Parse a MIDI track chunk
 *
 * @param {module:buffercursor} cursor - Buffer to parse
 * @return {module:midijs/lib/file/track~Track} Parsed track
 */
function parseTrack(cursor) {
    var chunk, events = [],
        result, runningStatus = null;
    
    chunk = parseChunk('MTrk', cursor);
    
    while (!chunk.eof()) {
        result = parseEvent(chunk, runningStatus);
        runningStatus = result.runningStatus;
        
        events.push(result.event);
    }
    
    return new Track(events);
}

exports.parseTrack = parseTrack;
