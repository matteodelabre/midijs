'use strict';

var chunk = require('./chunk');

var classApply = require('../util/class-apply');
var buffer = require('../util/buffer');
var convertNote = require('../util/convert-note');
var MalformedError = require('../util/errors').MalformedError;
var Event = require('../events/event');
var MetaEvent = require('../events/meta-event');
var SysexEvent = require('../events/sysex-event');
var ChannelEvent = require('../events/channel-event');

/**
 * @class Track
 * @classdesc A MIDI file is a sequence of one or more tracks,
 * that are sequences of zero or more events, terminated
 * by END_OF_TRACK meta events
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
        event = Event.decode(data, runningStatus);
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
 * Shortcut for creating a MetaEvent and adding it
 * to the events queue
 *
 * @param {...args} arguments Arguments to {@link MetaEvent}
 * @return {Track} This track
 */
Track.prototype.meta = function () {
    this.events.push(classApply(MetaEvent, arguments));
    return this;
};

/**
 * Shortcut for creating a SysexEvent and adding it
 * to the events queue
 *
 * @param {...args} arguments Arguments to {@link SysexEvent}
 * @return {Track} This track
 */
Track.prototype.sysex = function () {
    this.events.push(classApply(SysexEvent, arguments));
    return this;
};

/**
 * Shortcut for creating a ChannelEvent and adding it
 * to the events queue
 *
 * @param {...args} arguments Arguments to {@link ChannelEvent}
 * @return {Track} This track
 */
Track.prototype.channel = function () {
    this.events.push(classApply(ChannelEvent, arguments));
};

/**
 * Shortcut for creating a note with given delay, that is made
 * up of a "note on" event with given velocity and pitch, followed
 * by a "note off" event delayed by the note's length
 *
 * @example <caption>Appending a note</caption>
 * track.note('E4', 240, 127);
 * // - or -
 * track.note(64, 240, 127);
 *
 * @example <caption>Appending a chord</caption>
 * track.note('C3+G3', 240, 127);
 * // - or -
 * track.note([48, 55], 240, 127);
 *
 * @param {Array<number|string>|number|string} note Kind of note to add
 * @param {number} [length=120] Note length
 * @param {number} [channel=0] Channel on which to play the note
 * @param {number} [delay=0] Note delay
 * @return {Track} This track
 */
Track.prototype.note = function (note, length, channel, delay, velocity) {
    if (Array.isArray(note)) {
        if (typeof note[0] === 'string') {
            note = note.map(convertNote);
        }
    } else if (typeof note === 'number') {
        note = [note];
    } else {
        note = note.toString().split('+').map(convertNote);
    }

    length = (isNaN(length)) ? 120 : length;
    channel = (isNaN(channel)) ? 0 : channel;
    delay = (isNaN(delay)) ? 0 : delay;
    velocity = (isNaN(velocity)) ? 127 : velocity;

    note.forEach(function (subnote, i) {
        this.channel('note on', {
            note: subnote,
            velocity: velocity
        }, channel, (i === 0 ? delay : 0));
    }, this);

    note.forEach(function (subnote, i) {
        this.channel('note off', {
            note: subnote,
            velocity: velocity
        }, channel, (i === 0 ? length : 0));
    }, this);

    return this;
};

/**
 * Ensure this track ends with an END_OF_TRACK event
 * (won't add one if there is already one)
 *
 * @return {Track} This track
 */
Track.prototype.end = function () {
    var last = this.events[this.events.length - 1];

    if (last.type !== MetaEvent.TYPE.END_OF_TRACK) {
        this.meta('end of track');
    }

    return this;
};