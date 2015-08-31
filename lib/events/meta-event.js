'use strict';

var util = require('util');
var objectAssign = require('object-assign');

var MIDIBuffer = require('../util/buffer');
var selectConst = require('../util/select-const');
var Event = require('./event');

/**
 * @class MetaEvent
 * @extends Event
 * @classdesc A meta MIDI event, only encountered in Standard MIDI files
 * as it holds information about the file itself
 *
 * @param {MetaEvent.TYPE} type Type of meta event
 * @param {Object} [data={}] Event data (@see MetaEvent.TYPE)
 * @param {number} [delay=0] Meta info delay in ticks
 */
function MetaEvent(type, data, delay) {
    var defaults;
    Event.call(this, delay);

    // you can use a string to represent a constant
    // e.g. "copyright notice" for MetaEvent.TYPE.COPYRIGHT_NOTICE
    if (typeof type === 'string') {
        type = selectConst(MetaEvent.TYPE, type);
    }

    /**
     * @prop {bool} unknown Whether this meta event is unknown or not
     */
    this.unknown = false;

    switch (type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        defaults = {number: 0};
        break;
    case MetaEvent.TYPE.TEXT:
    case MetaEvent.TYPE.COPYRIGHT_NOTICE:
    case MetaEvent.TYPE.SEQUENCE_NAME:
    case MetaEvent.TYPE.INSTRUMENT_NAME:
    case MetaEvent.TYPE.LYRICS:
    case MetaEvent.TYPE.MARKER:
    case MetaEvent.TYPE.CUE_POINT:
    case MetaEvent.TYPE.PROGRAM_NAME:
    case MetaEvent.TYPE.DEVICE_NAME:
        defaults = {text: ''};
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        defaults = {};
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        defaults = {tempo: 120};
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        defaults = {
            rate: 24,
            hours: 0,
            minutes: 0,
            seconds: 0,
            frames: 0,
            subframes: 0
        };
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        defaults = {
            numerator: 4,
            denominator: 4,
            metronome: 24,
            notated32ndsPerMIDIBeat: 8
        };
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        defaults = {
            note: 0,
            major: true
        };
        break;
    case MetaEvent.TYPE.SEQUENCER_SPECIFIC:
        defaults = {bytes: new Buffer(0)};
        break;
    default:
        this.unknown = true;
        defaults = {bytes: new Buffer(0)};
    }

    this.type = type;
    this.data = objectAssign(defaults, data);
}

util.inherits(MetaEvent, Event);
module.exports = MetaEvent;

/**
 * Types of meta events, including the properties
 * that should be passed along with them
 *
 * @readonly
 * @static
 * @enum {number}
 */
MetaEvent.TYPE = Object.freeze({
    /**
     * Sequence number of this track. Should always be at the start
     * of a track, with a delay of 0
     * {number} [data.number=0] Sequence number
     */
    SEQUENCE_NUMBER: 0,

    /**
     * Arbitrary text (comments, notes, ...)
     * {string} [data.text=''] Text
     */
    TEXT: 1,

    /**
     * Copyright of this file (© YYYY, Author). Should always be at the
     * start of a track, with a delay of 0
     * {string} [data.text=''] Copyright notice
     */
    COPYRIGHT_NOTICE: 2,

    /**
     * Name of the track. Should always be at the start of a track,
     * with a delay of 0
     * {string} [data.text=''] Sequence name
     */
    SEQUENCE_NAME: 3,

    /**
     * Name of the instrument used in this track
     * {string} [data.text=''] Instrument name
     */
    INSTRUMENT_NAME: 4,

    /**
     * Lyrics to be sung at this point of the song
     * {string} [data.text=''] Lyrics
     */
    LYRICS: 5,

    /**
     * Mark a significant point in the song
     * {string} [data.text=''] Marker
     */
    MARKER: 6,

    /**
     * Mark a point where some kind of action should start
     * {string} [data.text=''] Cue point
     */
    CUE_POINT: 7,

    /**
     * Embed the patch/program name that is called up by the
     * immediately subsequent Bank Select and Program Change messages.
     * {string} [data.text=''] Program name
     */
    PROGRAM_NAME: 8,

    /**
     * Identify the hardware device used to produce sounds for this track.
     * {string} [props.text=''] Device name
     */
    DEVICE_NAME: 9,

    /**
     * Mark the end of the track
     * (this is automatically added by the Track#end method)
     */
    END_OF_TRACK: 47,

    /**
     * Change the tempo for the next events
     * {number} [data.tempo=120] Tempo in beats per minute
     */
    SET_TEMPO: 81,

    /**
     * Set the SMPTE starting point relative to the beginning of the track
     * {number} [data.rate=24] Frame rate (24, 25, 30 fps)
     * {number} [data.hours=0] Hour offset (0 - 23)
     * {number} [data.minutes=0] Minute offset (0 - 59)
     * {number} [data.seconds=0] Second offset (0 - 59)
     * {number} [data.frames=0] Frame offset (0 - rate)
     * {number} [data.subframes=0] Subframe offset (0 - 99)
     */
    SMPTE_OFFSET: 84,

    /**
     * Change the time signature
     * {number} [data.numerator=4] Numerator
     * {number} [data.denominator=4] Denominator
     * {number} [data.metronome=24] Metronome frequency (clock sigs. per pulse)
     * {number} [data.notated32ndsPerMIDIBeat=8] Number of notated 32nd notes
     */
    TIME_SIGNATURE: 88,

    /**
     * Change the key signature
     * {boolean} [data.major=true] Major or minor
     * {number} [data.note=0] Number of sharps (>0), or flats (<0)
     */
    KEY_SIGNATURE: 89,

    /**
     * Add sequencer-specific data
     * {Buffer} [data.bytes=new Buffer(0)] Message bytes
     */
    SEQUENCER_SPECIFIC: 127
});

/**
 * @inheritdoc
 */
MetaEvent._decodeInternal = function (buf, delay) {
    var type, data = {}, length,
        value, rates = [24, 25, 30, 30];

    type = buf.readUIntLE(8);
    length = buf.readVarInt();

    switch (type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        data.number = buf.readUIntBE(16);
        break;
    case MetaEvent.TYPE.TEXT:
    case MetaEvent.TYPE.COPYRIGHT_NOTICE:
    case MetaEvent.TYPE.SEQUENCE_NAME:
    case MetaEvent.TYPE.INSTRUMENT_NAME:
    case MetaEvent.TYPE.LYRICS:
    case MetaEvent.TYPE.MARKER:
    case MetaEvent.TYPE.CUE_POINT:
    case MetaEvent.TYPE.PROGRAM_NAME:
    case MetaEvent.TYPE.DEVICE_NAME:
        data.text = buf.toString('utf8', length);
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        data.tempo = 60000000 / ((buf.readUIntLE(8) << 16) +
                      (buf.readUIntLE(8) << 8) +
                       buf.readUIntLE(8));
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        value = buf.readUIntLE(8);

        data.rate = rates[value >> 6];
        data.hours = value & 0x3F;
        data.minutes = buf.readUIntLE(8);
        data.seconds = buf.readUIntLE(8);
        data.frames = buf.readUIntLE(8);
        data.subframes = buf.readUIntLE(8);
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        data.numerator = buf.readUIntLE(8);
        data.denominator = Math.pow(2, buf.readUIntLE(8));
        data.metronome = buf.readUIntLE(8);
        data.notated32ndsPerMIDIBeat = buf.readUIntLE(8);
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        data.note = buf.readIntLE(8);
        data.major = !buf.readUIntLE(8);
        break;
    default:
        // SEQUENCER_SPECIFIC & other unrecognized events
        data.bytes = buf.slice(length).toBuffer();
    }

    return new MetaEvent(type, data, delay);
};

/**
 * @inheritdoc
 */
MetaEvent.prototype._encodeInternal = function () {
    var result, length, buf, value, rates;

    rates = [24, 25, 30, 30];

    switch (this.type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        buf = new MIDIBuffer(2);
        buf.writeUIntBE(16, this.data.number);
        break;
    case MetaEvent.TYPE.TEXT:
    case MetaEvent.TYPE.COPYRIGHT_NOTICE:
    case MetaEvent.TYPE.SEQUENCE_NAME:
    case MetaEvent.TYPE.INSTRUMENT_NAME:
    case MetaEvent.TYPE.LYRICS:
    case MetaEvent.TYPE.MARKER:
    case MetaEvent.TYPE.CUE_POINT:
    case MetaEvent.TYPE.PROGRAM_NAME:
    case MetaEvent.TYPE.DEVICE_NAME:
        buf = new MIDIBuffer(Buffer.byteLength(this.data.text, 'utf8'));
        buf.write(this.data.text, 'utf8');
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        buf = new MIDIBuffer(0);
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        buf = new MIDIBuffer(3);

        value = 60000000 / this.data.tempo;
        buf.writeUIntLE(8, value >> 16);
        buf.writeUIntLE(8, (value >> 8) & 0xFF);
        buf.writeUIntLE(8, value & 0xFF);
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        buf = new MIDIBuffer(5);

        value = (rates.indexOf(this.data.rate) << 6) + (this.data.hours & 0x3F);
        buf.writeUIntLE(8, value);
        buf.writeUIntLE(8, this.data.minutes);
        buf.writeUIntLE(8, this.data.seconds);
        buf.writeUIntLE(8, this.data.frames);
        buf.writeUIntLE(8, this.data.subframes);
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        buf = new MIDIBuffer(4);

        buf.writeUIntLE(8, this.data.numerator);
        buf.writeUIntLE(8, Math.log(this.data.denominator) / Math.LN2);
        buf.writeUIntLE(8, this.data.metronome);
        buf.writeUIntLE(8, this.data.notated32ndsPerMIDIBeat);
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        buf = new MIDIBuffer(2);

        buf.writeIntLE(8, this.data.note);
        buf.writeUIntLE(8, +!this.data.major);
        break;
    default:
        // SEQUENCER_SPECIFIC & other unrecognized events
        buf = new MIDIBuffer(this.data.bytes);
    }

    length = buf.getLength();
    result = new MIDIBuffer(
        length + MIDIBuffer.getVarIntLength(length) + 2
    );

    result.writeUIntLE(8, 0xFF);
    result.writeUIntLE(8, this.type);
    result.writeVarInt(length);
    result.copy(buf);

    return result;
};
