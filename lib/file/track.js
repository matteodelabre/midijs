'use strict';

var chunk = require('./chunk');

var buffer = require('../util/buffer');
var error = require('../util/error');

var Event = require('../events/event');
var MetaEvent = require('../events/meta-event');
var SysexEvent = require('../events/sysex-event');
var ChannelEvent = require('../events/channel-event');

/**
 * Construct a new Track
 *
 * @class Track
 * @classdesc A track from a Standard MIDI file (a sequence of MIDI events)
 *
 * @param {Array<Event>} [events=[]] List of events in the track
 */
function Track(events) {
    this.events = (Array.isArray(events)) ? events : [];
}

exports.Track = Track;

/**
 * Decode a SMF track
 *
 * @static
 * @param {Buffer} buf Bytes to read
 * @throws {MIDIDecodeError} If the type of chunk is invalid
 * @return {Track} Decoded track representation
 */
Track.decode = function (buf) {
    var decoded = chunk.decode(buf), runningStatus = {},
        data = decoded.data, event, events = [];

    if (decoded.type !== 'MTrk') {
        throw new error.MIDIDecodeError(
            'Expected a track chunk, found invalid "' + decoded.type + '"'
        );
    }

    buffer.start(data);

    while (!buffer.eof(data)) {
        event = Event.decode(data, runningStatus);
        events.push(event);
    }

    // add an "end of track" event if the file is malformed
    // and doesn't provide one
    if (event.type !== MetaEvent.TYPE.END_OF_TRACK) {
        events.push(new MetaEvent(MetaEvent.TYPE.END_OF_TRACK));
    }

    return new Track(events);
};

/**
 * Encode this track to SMF bytes
 *
 * @return {Buffer} Encoded bytes
 */
Track.prototype.encode = function () {
    var data = [], runningStatus = {};

    this.events.forEach(function (event, i) {
        data[i] = event.encode(runningStatus);
    });

    return chunk.encode('MTrk', Buffer.concat(data));
};

/**
 * Queue a meta event to the track
 *
 * @param {MetaEvent.TYPE} type Type of meta event
 * @param {Object} [data={}] Meta data
 * @param {number} [delay=0] Delay between the previous event and this event
 * @return {null}
 */
Track.prototype.meta = function (type, data, delay) {
    this.events.push(new MetaEvent(type, data, delay));
};

/**
 * Queue a sysex event to the track
 *
 * @param {number} type Type of sysex event
 * @param {Buffer} data Sysex data
 * @param {number} [delay=0] Delay between the previous event and this event
 * @return {null}
 */
Track.prototype.sysex = function (type, data, delay) {
    this.events.push(new SysexEvent(type, data, delay));
};

/**
 * Queue a channel event to the track
 *
 * @param {number} type Type of channel event
 * @param {Buffer} [data={}] Event data
 * @param {number} [channel=0] Channel this event applies to
 * @param {number} [delay=0] Delay between the previous event and this event
 * @return {null}
 */
Track.prototype.channel = function (type, data, channel, delay) {
    this.events.push(new ChannelEvent(type, data, channel, delay));
};
