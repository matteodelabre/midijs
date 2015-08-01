'use strict';

var chunk = require('./chunk');

var classApply = require('../util/class-apply');
var buffer = require('../util/buffer');
var error = require('../util/error');

var Event = require('../event/event');
var MetaEvent = require('../event/meta-event');
var SysexEvent = require('../event/sysex-event');
var ChannelEvent = require('../event/channel-event');

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

    return new Track(events).end();
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
 * General method for event creation shortcuts
 *
 * @param {function} Ctor Event constructor
 * @return {function} Event creator
 */
function eventCreator(Ctor) {
    return function (type) {
        var args;

        type = (isNaN(type)) ? Ctor.TYPE[type] : type;
        args = [type].concat([].slice.call(arguments, 1));

        this.events.push(classApply(Ctor, args));
        return this;
    };
}

/**
 * Queue a meta event to the track
 *
 * @param {MetaEvent.TYPE|string} type Either a type name or a type constant
 * @param {...args} args Other arguments to {@link MetaEvent}
 * @return {Track} This track
 */
Track.prototype.meta = eventCreator(MetaEvent);

/**
 * Queue a sysex event to the track
 *
 * @param {SysexEvent.TYPE|string} type Either a type name or a type constant
 * @param {...args} args Other arguments to {@link SysexEvent}
 * @return {Track} This track
 */
Track.prototype.sysex = eventCreator(SysexEvent);

/**
 * Queue a channel event to the track
 *
 * @param {ChannelEvent.TYPE|string} type Either a type name or a type constant
 * @param {...args} args Other arguments to {@link ChannelEvent}
 * @return {Track} This track
 */
Track.prototype.channel = eventCreator(ChannelEvent);

/**
 * Ensure this track ends with an END_OF_TRACK event
 * (won't add one if there is already one)
 *
 * @return {Track} This track
 */
Track.prototype.end = function () {
    var last = this.events[this.events.length - 1];

    if (last.type !== MetaEvent.TYPE.END_OF_TRACK) {
        this.meta('END_OF_TRACK');
    }

    return this;
};
