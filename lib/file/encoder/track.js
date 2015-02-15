/**
 * @private
 * @module midijs/lib/file/parser/track
 */

'use strict';

var encodeChunk = require('./chunk').encodeChunk;
var encodeEvent = require('./event').encodeEvent;
var buffer = require('buffer');

/**
 * Parse a MIDI track chunk
 *
 * @param {module:midijs/lib/file/track~Track} track - Track to encode
 * @return {Buffer} Encoded track
 */
function encodeTrack(track) {
    var events = track.events, length = events.length, i;
    
    for (i = 0; i < length; i += 1) {
        events[i] = encodeEvent(events[i]);
    }
    
    return encodeChunk('MTrk', buffer.Buffer.concat(events));
}

exports.encodeTrack = encodeTrack;
