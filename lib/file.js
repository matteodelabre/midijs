/**
 * @module midijs/lib/file
 */

'use strict';

var buffer = require('buffer');
var util = require('util');
var stream = require('stream');
var BufferCursor = require('buffercursor');

var Header = require('./file/header').Header;
var MIDIEvent = require('./file/event').Event;
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
 * @extends stream.Duplex
 * @param {?Buffer} data - Shortcut for calling setData()
 * @param {?Function} callback - Callback for setData() shortcut
 */
function File(data, callback) {
    stream.Duplex.call(this);
    
    this._header = new Header();
    this._tracks = [];
    
    if (data && buffer.Buffer.isBuffer(data)) {
        this.setData(data, callback || noop);
    }
}

util.inherits(File, stream.Duplex);

/** {@link module:midijs/lib/file/header~Header} */
File.Header = Header;

/** {@link module:midijs/lib/file/event~Event} */
File.Event = MIDIEvent;

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
    if (!Array.isArray(this._data)) {
        this._data = [chunk];
    } else {
        this._data.push(chunk);
    }
    
    callback();
};

/**
 * Close the writable stream and start parsing
 *
 * @return {void}
 */
File.prototype.end = function () {
    var data;
    
    stream.Duplex.prototype.end.call(this);
    data = buffer.Buffer.concat(this._data);
    delete this._data;
    
    this.setData(data, function (err) {
        if (err) {
            this.emit('error', err);
            return;
        }
        
        this.emit('parsed');
    }.bind(this));
};

/**
 * Encode file data and get it
 *
 * @param {Function} callback - Called when the file is encoded
 * @return {void}
 */
File.prototype.getData = function (callback) {
    var header, tracks = [],
        length, err = null, data = null, i;
    
    try {
        header = encodeHeader(this._header);
        length = this._header._trackCount;

        for (i = 0; i < length; i += 1) {
            tracks.push(encodeTrack(this._tracks[i]));
        }
        
        data = buffer.Buffer.concat([header].concat(tracks));
    } catch (e) {
        err = e;
    }
    
    callback(err, data);
};

/**
 * Set file data and parse it
 *
 * @param {Buffer} data - Data to parse
 * @param {Function} callback - Called when data is parsed
 * @return {module:midijs/lib/file~File} Current instance
 */
File.prototype.setData = function (data, callback) {
    var header, tracks = [], cursor,
        length, err = null, i;
    
    try {
        cursor = new BufferCursor(data);
        header = parseHeader(cursor);
        
        length = header._trackCount;

        for (i = 0; i < length; i += 1) {
            tracks.push(parseTrack(cursor));
        }
        
        if (header.getFileType() === 0 && length > 1) {
            tracks = tracks.slice(0, 1);
        }

        this._header = header;
        this._tracks = tracks;
    } catch (e) {
        err = e;
    }
    
    callback(err);
};

/**
 * Get this file's header
 *
 * @return {module:midijs/lib/header~Header} File's header
 */
File.prototype.getHeader = function () {
    return this._header;
};

/**
 * Get this file's tracks
 *
 * @return {Array<module:midijs/lib/track~Track>}
 */
File.prototype.getTracks = function () {
    return [].slice.call(this._tracks);
};

/**
 * Get a track from this file
 *
 * @param {Number} index - Index of the track to get
 * @return {module:midijs/lib/track~Track|undefined} The track, or undefined
 */
File.prototype.getTrack = function (index) {
    return this._tracks[index];
};

/**
 * Add a track to this file
 *
 * @param {Number} [index=length] - Index of the track
 * @param {...module:midijs/lib/file/event~Event}
 * events - List of events in the track
 * @return {module:midijs/lib/file~File} Current instance
 */
File.prototype.addTrack = function (index, events) {
    if (Array.isArray(index)) {
        events = index;
        index = this._tracks.length;
    } else if (!Array.isArray(events)) {
        if (typeof index !== 'number') {
            events = [].slice.call(arguments);
            index = this._tracks.length;
        } else {
            events = [].slice.call(arguments, 1);
        }
    }
    
    this._tracks.splice(index, 0, new Track(events));
    this._header._trackCount += 1;
    
    return this;
};

/**
 * Remove a track from this file
 *
 * @param {Number} [index=-1] - Index of the track to remove
 * @return {module:midijs/lib/file~File} Current instance
 */
File.prototype.removeTrack = function (index) {
    if (index === undefined) {
        index = -1;
    }
    
    this._header._trackCount -= this._tracks.splice(index, 1).length;
    return this;
};
