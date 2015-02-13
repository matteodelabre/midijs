/*eslint no-underscore-dangle:0 */

/**
 * @module midijs/lib/file
 */

'use strict';

var buffer = require('buffer');
var util = require('util');
var stream = require('stream');
var BufferCursor = require('buffercursor');

var Header = require('./file/header').Header;
var parseHeader = require('./file/parser/header').parseHeader;
var parseTrack = require('./file/parser/track').parseTrack;

/**
 * MIDI file reader and writer
 *
 * Parse and encode MIDI data
 *
 * @constructor
 * @param {String|Buffer|void} data - MIDI data as a Buffer or as a string
 */
function File(data) {
    stream.Writable.call(this);
    
    if (!data) {
        this.data = new buffer.Buffer([]);
    } else if (buffer.Buffer.isBuffer(data)) {
        this.data = data;
    } else {
        this.data = new buffer.Buffer(data, 'utf8');
    }
    
    this.header = new Header();
    this.tracks = [];
}

util.inherits(File, stream.Writable);
exports.File = File;

/**
 * Parse data
 * 
 * Will be called automatically by .end()
 *
 * @param {Function} callback - Called when the file is parsed
 * @return {void}
 */
File.prototype.parse = function (callback) {
    var header, tracks = [],
        cursor, length, i;
    
    callback = callback || function () {
        return undefined;
    };
    
    try {
        cursor = new BufferCursor(this.data);
        header = parseHeader(cursor);

        if (header.fileType === 0 && header.trackCount > 1) {
            throw new Error('Invalid file type "0" with more than one track');
        }

        length = header.trackCount;

        for (i = 0; i < length; i += 1) {
            tracks.push(parseTrack(cursor));
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

/**
 * Encode data
 *
 * @param {Function} callback - Called when the file is encoded
 * @return {void}
 */
File.prototype.encode = function () {
    return undefined;
};

/**
 * Called when data is written to the stream
 *
 * @private
 * @param {Buffer} chunk - Data chunk
 * @param {String} encoding - Unused
 * @param {Function} callback -  Should be called when we are done processing
 * @return {void}
 */
File.prototype._write = function (chunk, encoding, callback) {
    this.data = buffer.Buffer.concat(
        [this.data, chunk],
        this.data.length + chunk.length
    );
    
    callback();
};

/**
 * Called when the stream is closed
 *
 * @private
 * @return {void}
 */
File.prototype.end = function () {
    this.parse();
    stream.Writable.prototype.end.apply(this, [].slice.call(arguments));
};
