/*jslint node:true, browser:true, bitwise:true, nomen:true */

'use strict';

var promise = require('es6-promise');
var buffer = require('buffer');
var util = require('util');
var stream = require('stream');
var BufferCursor = require('buffercursor');

var Chunk = require('./chunk').Chunk;

/**
 * MIDI file reader
 *
 * Parse MIDI data
 *
 * @param {data: string|Buffer|undefined} MIDI data as a Buffer or as a string
 */
function Reader(data) {
    stream.Writable.call(this);
    
    if (!data) {
        this.data = new buffer.Buffer([]);
    } else if (buffer.Buffer.isBuffer(data)) {
        this.data = data;
    } else {
        this.data = new buffer.Buffer(data, 'utf8');
    }
}

util.inherits(Reader, stream.Writable);
exports.Reader = Reader;

/**
 * Start parsing data
 * 
 * Will be called automatically by .end()
 *
 * @param {callback: function}  Called when the file is parsed
 */
Reader.prototype.parse = function (callback) {
    var header, tracks = [],
        cursor, length, i;
    
    callback = callback || function () {
        return undefined;
    };
    
    try {
        cursor = new BufferCursor(this.data);
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
    } catch (err) {
        this.emit('error', err);
        callback(err);
    } finally {
        this.emit('parsed');
        callback();
    }
};

Reader.prototype._write = function (chunk, encoding, callback) {
    this.data = buffer.Buffer.concat(
        [this.data, chunk],
        this.data.length + chunk.length
    );
    
    callback();
    chunk = encoding; // avoiding JSLint unused error
};

Reader.prototype.end = function () {
    this.parse();
    stream.Writable.prototype.end.apply(this, [].slice.call(arguments));
};