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
var Event = require('./file/event').Event;
var MetaEvent = require('./file/event').MetaEvent;
var SysexEvent = require('./file/event').SysexEvent;
var ChannelEvent = require('./file/event').ChannelEvent;
var Track = require('./file/track').Track;

var parseHeader = require('./file/parser/header').parseHeader;
var parseTrack = require('./file/parser/track').parseTrack;
var encodeHeader = require('./file/encoder/header').encodeHeader;
var encodeTrack = require('./file/encoder/track').encodeTrack;

/**
 * Parse and encode MIDI data
 *
 * @constructor
 * @param {String|Buffer|void} data - MIDI data as a Buffer or as a string
 * @property {Buffer} data - Raw data of this file
 * @property {module:midijs/lib/file/header~Header} header - File header
 * @property {Array<module:midijs/lib/file/track~Track>} tracks
 * List of file tracks
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

util.inherits(File, stream.Duplex);

/** {@link module:midijs/lib/file/header~Header} */
File.Header = Header;

/** {@link module:midijs/lib/file/event~Event} */
File.Event = Event;

/** {@link module:midijs/lib/file/event~MetaEvent} */
File.MetaEvent = MetaEvent;

/** {@link module:midijs/lib/file/event~SysexEvent} */
File.SysexEvent = SysexEvent;

/** {@link module:midijs/lib/file/event~ChannelEvent} */
File.ChannelEvent = ChannelEvent;

/** {@link module:midijs/lib/file/track~Track} */
File.Track = Track;

exports.File = File;

/**
 * Parse data
 * (will be called automatically by .end())
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
 * Add data to parse
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
 * Encode data
 *
 * @param {Function} callback - Called when the file is encoded
 * @return {void}
 */
File.prototype.encode = function (callback) {
    var header, tracks = [],
        length, i;
    
    callback = callback || function () {
        return undefined;
    };
    
    try {
        header = encodeHeader(this.header);
        length = this.header.trackCount;

        for (i = 0; i < length; i += 1) {
            tracks.push(encodeTrack(this.tracks[i]));
        }
        
        this.data = buffer.Buffer.concat([header].concat(tracks));
    } catch (err) {
        this.emit('error', err);
        callback(err);
    } finally {
        this.emit('encoded');
        callback();
    }
};

/**
 * Read encoded data
 *
 * @private
 * @param {Number} size - 

/**
 * Parse data when writing ends
 *
 * @private
 * @return {void}
 */
File.prototype.end = function () {
    this.parse();
    stream.Writable.prototype.end.apply(this, [].slice.call(arguments));
};
