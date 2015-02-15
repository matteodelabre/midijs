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

var noop = function () {};

/**
 * Parse and encode MIDI data
 *
 * @constructor
 * @param {?Buffer} data - Shortcut for calling setData()
 * @param {?Function} callback - Callback for setData() shortcut
 * @property {Buffer} data - Raw data of this file
 * @property {module:midijs/lib/file/header~Header} header - File header
 * @property {Array<module:midijs/lib/file/track~Track>} tracks
 * List of file tracks
 */
function File(data, callback) {
    stream.Duplex.call(this);
    
    this.header = new Header();
    this.tracks = [];
    
    if (data && buffer.Buffer.isBuffer(data)) {
        this.setData(data, callback || noop);
    }
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
 * Encode file data and get it
 *
 * @param {Function} callback - Called when the file is encoded
 * @return {void}
 */
File.prototype.getData = function (callback) {
    var header, tracks = [], data,
        length, i;
    
    callback = callback || noop;
    
    try {
        header = encodeHeader(this.header);
        length = this.header.trackCount;

        for (i = 0; i < length; i += 1) {
            tracks.push(encodeTrack(this.tracks[i]));
        }
        
        data = buffer.Buffer.concat([header].concat(tracks));
        callback(null, data);
    } catch (err) {
        callback(err);
    }
};

/**
 * Set file data and parse it
 *
 * @param {Buffer} data - Data to parse
 * @param {Function} callback - Called when data is parsed
 * @return {void}
 */
File.prototype.setData = function (data, callback) {
    var header, tracks = [], cursor,
        length, i;
    
    callback = callback || noop;
    
    try {
        cursor = new BufferCursor(data);
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
        
        callback();
    } catch (err) {
        callback(err);
    }
};

/**
 * Read encoded data
 *
 * @private
 * @return {void}
 */
File.prototype._read = function () {
    this.getData(function (err, data) {
        if (err) {
            this.emit('error', err);
            return;
        }
        
        this.push(data);
        this.push(null);
    }.bind(this));
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
    if (this._data === undefined) {
        this._data = chunk;
    } else {
        this._data = buffer.Buffer.concat(
            [this._data, chunk],
            this._data.length + chunk.length
        );
    }
    
    callback();
};

/**
 * Indicates the end of writing
 *
 * @private
 * @return {void}
 */
File.prototype.end = function () {
    this.setData(this._data, function (err) {
        if (err) {
            this.emit('error', err);
            return;
        }
        
        stream.Writable.prototype.end.apply(this, [].slice.call(arguments));
    }.bind(this));
};

/**
 * Add a new track to the file
 *
 * @param {?Array<module:midijs/lib/file/event~Event>|...module:midijs/lib/file/event~Event}
 * List of events in the track
 * @return {<module:midijs/lib/file~File} Current instance
 */
File.prototype.addTrack = function (events) {
    if (arguments.length > 1) {
        events = [].slice.call(arguments);
    } else if (events === undefined || events === null) {
        events = [];
    } else if (events instanceof Event) {
        events = [events];
    }
    
    this.tracks.push(new Track(events));
    this.header.trackCount += 1;
    
    return this;
};
