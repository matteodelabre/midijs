'use strict';

var chunk = require('./chunk');

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
 * Decode this track from SMF bytes
 *
 * @static
 * @param {Buffer} buf Bytes to read
 * @return {Track} Decoded track representation
 */
Track.decode = function (buf) {
    // TODO
};

/**
 * Encode this track to SMF bytes
 *
 * @return {Buffer} Encoded bytes
 */
Track.prototype.encode = function () {
    var data = [], runningStatus = null;

    this.events.forEach(function (event) {
        // TODO
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
