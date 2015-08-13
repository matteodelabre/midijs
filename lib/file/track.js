'use strict';

var chunk = require('./chunk');

var classApply = require('../util/class-apply');
var buffer = require('../util/buffer');
var MalformedError = require('../util/errors').MalformedError;
var events = require('../events');

/**
 * Construct a new Track
 *
 * @class Track
 * @classdesc A track from a Standard MIDI file (a sequence of MIDI events)
 *
 * @param {Array<Event>} [eventList=[]] List of events in the track
 */
function Track(eventList) {
    this.events = (Array.isArray(eventList)) ? eventList : [];
}

module.exports = Track;

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
        data = decoded.data, event, eventList = [];

    if (decoded.type !== 'MTrk') {
        throw new MalformedError(
            'Expected a track chunk following header or another track, ' +
            'but found invalid "' + decoded.type + '" chunk'
        );
    }

    buffer.start(data);

    while (!buffer.eof(data)) {
        event = events.Event.decode(data, runningStatus);
        eventList.push(event);
    }

    return new Track(eventList).end();
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
 * @param {...args} arguments Arguments to {@link MetaEvent}
 * @return {Track} This track
 */
Track.prototype.meta = function () {
    this.events.push(classApply(events.MetaEvent, arguments));
    return this;
};

/**
 * Queue a sysex event to the track
 *
 * @param {...args} arguments Arguments to {@link SysexEvent}
 * @return {Track} This track
 */
Track.prototype.sysex = function () {
    this.events.push(classApply(events.SysexEvent, arguments));
    return this;
};

/**
 * Queue a channel event to the track
 *
 * @param {...args} arguments Arguments to {@link ChannelEvent}
 * @return {Track} This track
 */
Track.prototype.channel = function () {
    this.events.push(classApply(events.ChannelEvent, arguments));
};

/**
 * Ensure this track ends with an END_OF_TRACK event
 * (won't add one if there is already one)
 *
 * @return {Track} This track
 */
Track.prototype.end = function () {
    var last = this.events[this.events.length - 1];

    if (last.type !== events.MetaEvent.TYPE.END_OF_TRACK) {
        this.meta('end of track');
    }

    return this;
};
