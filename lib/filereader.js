/*jslint node:true, browser:true, bitwise:true */

'use strict';

var promise = require('es6-promise');
var buffer = require('buffer');
var BufferCursor = require('buffercursor');

var Chunk = require('./parser/chunk').Chunk;

/**
 * MIDI file reader
 *
 * Parse MIDI data
 *
 * @param {data: string|Buffer} MIDI data as a Buffer or as a string
 */
function FileReader(data) {
    var header, tracks = [],
        cursor, length, i;
    
    if (!buffer.Buffer.isBuffer(data)) {
        data = new buffer.Buffer(data, 'utf8');
    }
    
    cursor = new BufferCursor(data);
    header = new Chunk(cursor);
    
    if (header.fileType === 0 && header.trackCount > 1) {
        throw new Error('Invalid file type "0" with more than one track');
    }
    
    length = header.trackCount;
    
    for (i = 0; i < length; i += 1) {
        tracks.push(new Chunk(cursor));
    }
    
    this.header = header;
    this.tracks = tracks;
}

exports.FileReader = FileReader;