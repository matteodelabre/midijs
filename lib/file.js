/*jshint node:true, browser:true */

'use strict';

var Note = require('./note');
var Channel = require('./channel');
var Stream = require('./stream');

/**
 * Load a file by its path
 *
 * @param {url: string}         Path to file
 * @return Promise
 */
function load(url) {
    return new window.Promise(function (resolve, reject) {
        var fetch = new XMLHttpRequest(), setImmediate;
        
        if (window.setImmediate) {
            setImmediate = window.setImmediate;
        } else {
            setImmediate = function (callback) {
                window.setTimeout(callback, 0);
            };
        }

        fetch.open('GET', url);
        fetch.overrideMimeType('text/plain; charset=x-user-defined');

        fetch.onreadystatechange = function () {
            if (this.readyState === this.DONE) {
                // wait for next tick before resolving, since
                // not found errors are triggered after readyState
                // change event
                setImmediate(function () {
                    resolve(fetch.responseText);
                });
            }
        };

        fetch.onerror = function () {
            reject(new Error(
                'Le fichier demandé est introuvable.'
            ));
        };

        fetch.send();
    });
}

/**
 * MIDI file
 *
 * Load and parse MIDI files
 *
 * @param {options: object} Litteral specifying file url or file data
 */
function File(options) {
    if (options.url !== undefined) {
        this.url = options.url;
    } else if (options.data !== undefined) {
        this.data = options.data;
    } else {
        throw new Error('Pass a resource url or raw data.');
    }
}

/**
 * Load data at given url and parse it
 *
 * If data is already loaded, this is equivalent to calling parse()
 *
 * @return Promise
 */
File.prototype.load = function () {
    return new Promise(function (resolve, reject) {
        if (this.url === undefined) {
            this.parse();
            resolve();
        } else {
            load(this.url).then(function (data) {
                this.data = data;
                this.parse();
                resolve();
            }.bind(this)).catch(reject);
        } 
    }.bind(this));
};

/**
 * Parse file data
 */
File.prototype.parse = function () {
    if (this.data === undefined) {
        throw new Error('No data to parse.');
    }
    
    var stream, header, headerStream,
        track, trackStream, trackCount,
        timeDivision, fileType;
    
    stream = new Stream(this.data);
    header = this._parseChunk(stream);
    
    if (header.id !== 'MThd') {
        throw new Error('Not a MIDI file.');
    }
    
    headerStream = new Stream(header.data);
    fileType = headerStream.readInt(16);
    trackCount = headerStream.readInt(16);
    timeDivision = headerStream.readInt(16);
    
    if (timeDivision > 0) {
        this._timeDivision = 'beat';
        this._ticksPerBeat = timeDivision;
        this._beatsPerMinute = 120;
    } else {
        this._timeDivision = 'frame';
        this._ticksPerFrame = timeDivision & 0x00FF;
        this._framesPerSecond = timeDivision & 0x7F00;
    }
    
    while (trackCount) {
        this._time = 0;
        this._runningStatus = null;
        track = this._parseChunk(stream);
        
        if (header.id !== 'MTrk') {
            throw new Error('Malformed file: expected track chunk');
        }
        
        trackStream = new Stream(track.data);
        
        while (!trackStream.eof()) {
            this._parseEvent(trackStream);
        }
    }
};

/**
 * Convert ticks in seconds
 *
 * @param {ticks: number}   Amount of ticks
 * @return number
 */
File.prototype._ticksToSeconds = function (ticks) {
    var ticksPerSecond;
    
    if (this._timeDivision === 'beat') {
        ticksPerSecond = this._ticksPerBeat * this._beatsPerMinute / 60;
    } else {
        ticksPerSecond = this._ticksPerFrame * this._framesPerSecond;
    }
    
    return ticks / ticksPerSecond;
};

/**
 * Parse a MIDI chunk
 *
 * @private
 * @param {stream: midi.Stream} Stream to parse
 * @return object
 */
File.prototype._parseChunk = function (stream) {
    var id, size, data;
    
    id = stream.readString(4);
    size = stream.readInt(32);
    data = stream.readString(size);
    
    return {
        id: id,
        size: size,
        data: data
    };
};

/**
 * Parse a MIDI event
 *
 * @private
 * @param {stream: midi.Stream} Stream to parse
 * @return object
 */
File.prototype._parseEvent = function (stream) {
    var deltaTime, type, mstype, lstype, data;
    
    deltaTime = this._ticksToSeconds(stream.readVarInt());
    this._time += deltaTime;
    
    type = stream.readInt(8);
    mstype = type & 0xF0;
    lstype = type & 0x0F;
    
    if (mstype === 0xF) {
        if (lstype === 0xF) {
            data = this._parseMetaEvent(stream);
        } else {
            data = this._parseSystemEvent(lstype, stream);
        }
    } else {
        if (mstype < 8) {
            if (this._runningStatus === null) {
                throw new Error('Malformed file: undefined event type');
            }
            
            type = this._runningStatus;
            mstype = type & 0xF0;
            lstype = type & 0x0F;
            
            stream.move(-1);
        } else {
            this._runningStatus = type;
        }
        
        data = this._parseChannelEvent(mstype, lstype, stream);
    }
};

/**
 * Parse a meta MIDI event
 *
 * @private
 * @param {stream: midi.Stream} Stream to parse
 * @return object
 */
File.prototype._parseMetaEvent = function (stream) {
    var length = stream.readVarInt();
    
    
};

/**
 * Parse a system MIDI event
 *
 * @private
 * @param {type: int}           Event type (0 - 14)
 * @param {stream: midi.Stream} Stream to parse
 * @return object
 */
File.prototype._parseSystemEvent = function (stream) {
    
};

/**
 * Parse a channel MIDI event
 *
 * @private
 * @param {type: int}           Event type (0 - 14)
 * @param {channnel: int}       Channel ID (0 - 15)
 * @param {stream: midi.Stream} Stream to parse
 * @return object|false
 */
File.prototype._parseChannelEvent = function (type, channel, stream) {
    var param1, param2;
    
    param1 = stream.readInt(8);
    
    if (type !== 12 && type !== 13) {
        param2 = stream.readInt(8);
    }
    
    switch (type) {
        case 8:
            return {
                type: 'noteOff',
                note: param1
            };
        case 9:
            return {
                type: 'noteOn',
                note: param1,
                velocity: param2
            };
        case 10:
            return {
                type: 'noteAftertouch',
                note: param1,
                pressure: param2
            };
        case 11:
            return {
                type: 'controller',
                controller: param1,
                value: param2
            };
        case 12:
            return {
                type: 'programChange',
                program: param1
            };
        case 13:
            return {
                type: 'channelAftertouch',
                pressure: param1
            };
        case 14:
            return {
                type: 'pitchBend',
                value: param1 + (param2 << 7) - 8192
            };
    }
    
    return false;
};

module.exports = File;















