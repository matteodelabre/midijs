/**
 * @private
 * @module midijs/lib/file/parser/track
 */

'use strict';

var encodeChunk = require('./chunk').encodeChunk;
var encodeEvent = require('./event').encodeEvent;
var buffer = require('buffer');

/**
 * Encode a MIDI track chunk
 *
 * @param {module:midijs/lib/file/track~Track} track - Track to encode
 * @return {Buffer} Encoded track
 */
function encodeTrack(track) {
    var events = track.getEvents(), data = [],
        length = events.length, i,
        runningStatus = null, result;
    
    for (i = 0; i < length; i += 1) {
        result = encodeEvent(events[i], runningStatus);
        runningStatus = result.runningStatus;
        
        data[i] = result.data;
    }
    
    return encodeChunk('MTrk', buffer.Buffer.concat(data));
}

exports.encodeTrack = encodeTrack;
