'use strict';

const stampit = require('stampit');

const Context = require('../events/context');
const MetaEvent = require('../events/meta-event');
const SysexEvent = require('../events/sysex-event');
const ChannelEvent = require('../events/channel-event');

const MIDIBuffer = require('../util/buffer');
const convertNote = require('../util/convert-note');
const nonMIDI = require('../util/constants').nonMIDIError;

/**
 * Create an object using given constructor with given arguments
 *
 * @param {function} Ctor Constructor to use
 * @param {Array} args Arguments to Pass
 * @see http://stackoverflow.com/a/8843181/3452708
 * @return {Ctor} Instanciated object
 */
function classApply(Ctor, args) {
    return new (Ctor.bind.apply(Ctor, [null].concat([].slice.call(args))));
}

/**
 * Track stamp
 *
 * A MIDI file is a sequence of one or more tracks, that are sequences
 * of zero or more events. This stamp represents a file's track.
 *
 * @param {Object} [args={}] Track arguments
 * @param {Array<Event>} [args.events=[]] List of events in this track
 */
const Track = stampit().props({
    events: []
}).static({
    /**
     * Decode a MIDI track
     *
     * @static
     * @param {MIDIBuffer|Buffer|Array|*} input Data to decode
     * @throws {Error} If the type of chunk is invalid
     * @return {Object} Decoded track representation
     */
    decode(input) {
        const decoded = new MIDIBuffer(input).readChunk();

        if (decoded.type !== 'MTrk') {
            throw new Error(
                nonMIDI + ': unexpected ' + decoded.type + ' chunk while ' +
                'reading the file. Expected a track (MTrk) chunk.'
            );
        }

        const ctx = new Context();
        return Track({
            events: ctx.decode(decoded.data)
        }).end();
    }
}).methods({
    /**
     * Encode this track to the standard MIDI format
     *
     * @return {Buffer} Encoded bytes
     */
    encode() {
        const ctx = new Context();
        const data = ctx.encode(this.events);

        const chunk = new MIDIBuffer(data.length + 8);
        chunk.writeChunk('MTrk', data);

        return chunk;
    },

    /**
     * Shortcut for creating a MetaEvent and adding it
     * to the events queue
     *
     * @param {...args} arguments Arguments to {@link MetaEvent}
     * @return {Object} This track
     */
    meta() {
        this.events.push(classApply(MetaEvent, arguments));
        return this;
    },

    /**
     * Shortcut for creating a SysexEvent and adding it
     * to the events queue
     *
     * @param {...args} arguments Arguments to {@link SysexEvent}
     * @return {Object} This track
     */
    sysex() {
        this.events.push(classApply(SysexEvent, arguments));
        return this;
    },

    /**
     * Shortcut for creating a ChannelEvent and adding it
     * to the events queue
     *
     * @param {...args} arguments Arguments to {@link ChannelEvent}
     * @return {Object} This track
     */
    channel() {
        this.events.push(classApply(ChannelEvent, arguments));
        return this;
    },

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
     * @param {number} [velocity=127] Note velocity
     * @return {Object} This track
     */
    note(note, length, channel, delay, velocity) {
        if (Array.isArray(note)) {
            note = note.map(convertNote);
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
            this.channel('note on', {
                note: subnote,
                velocity: 0
            }, channel, (i === 0 ? length : 0));
        }, this);

        return this;
    },

    /**
     * Ensure this track ends with an END_OF_TRACK event
     * (it won't add one if there is already one)
     *
     * @return {Object} This track
     */
    end() {
        const last = this.events[this.events.length - 1];

        if (last && last.type !== MetaEvent.TYPE.END_OF_TRACK) {
            this.meta('end of track');
        }

        return this;
    }
});

module.exports = Track;
