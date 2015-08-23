'use strict';

var util = require('util');
var objectAssign = require('object-assign');

var buffer = require('../util/buffer');
var selectConst = require('../util/select-const');
var convertNote = require('../util/convert-note');
var Event = require('./event');

/**
 * @class ChannelEvent
 * @extends Event
 * @classdesc A channel MIDI event. This kind of event is the most important
 * one, it describes the state of the instruments, relative to the previous
 * state. Channel events can be transmitted between devices and can
 * also be present in Standard MIDI files.
 *
 * @param {ChannelEvent.TYPE|string} type Type of channel event
 * @param {Object} [data={}] Event data (@see ChannelEvent.TYPE)
 * @param {number} [channel=0] Channel to which the event applies
 * @param {number} [delay=0] Channel event delay in ticks
 */
function ChannelEvent(type, data, channel, delay) {
    var defaults, note, controllerType, instrument;
    Event.call(this, delay);

    // you can use a string to represent a constant
    // e.g. "note on" for ChannelEvent.TYPE.NOTE_ON
    if (typeof type === 'string') {
        type = selectConst(ChannelEvent.TYPE, type);
    }

    switch (type) {
    case ChannelEvent.TYPE.NOTE_ON:
    case ChannelEvent.TYPE.NOTE_OFF:
        defaults = {
            note: 0,
            velocity: 127
        };
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        defaults = {
            note: 0,
            pressure: 0
        };
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        defaults = {
            type: 0,
            value: 127
        };
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        defaults = {instrument: 0};
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        defaults = {pressure: 0};
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        defaults = {value: 0};
        break;
    default:
        throw new Error('Unknown channel event type: ' + type);
    }

    this.type = type;
    this.channel = channel || 0;
    this.data = objectAssign(defaults, data);

    // transform constant shortcuts
    note = this.data.note;
    controllerType = this.data.type;
    instrument = this.data.instrument;

    switch (type) {
    case ChannelEvent.TYPE.NOTE_ON:
    case ChannelEvent.TYPE.NOTE_OFF:
        if (typeof note === 'string') {
            this.data.note = convertNote(note);
        }
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        if (typeof controllerType === 'string') {
            this.data.type = selectConst(
                ChannelEvent.CONTROLLER, controllerType
            );
        }
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        if (typeof instrument === 'string') {
            this.data.instrument = selectConst(
                ChannelEvent.INSTRUMENT, instrument
            );
        }
    }
}

util.inherits(ChannelEvent, Event);
module.exports = ChannelEvent;

/**
 * Types of channel events, including the properties
 * that should be passed along with them
 *
 * @readonly
 * @static
 * @enum {number}
 */
ChannelEvent.TYPE = Object.freeze({
    /**
     * Set a note off
     * {number} [data.note=0] Event note
     * {number} [data.velocity=127] Note velocity
     */
    NOTE_OFF: 8,

    /**
     * Set a note on
     * {number} [data.note=0] Event note
     * {number} [data.velocity=127] Note velocity
     */
    NOTE_ON: 9,

    /**
     * Change the pressure applied on a note
     * {number} [data.note=0] Event note
     * {number} [data.pressure=0] Note pressure
     */
    NOTE_AFTERTOUCH: 10,

    /**
     * Set the value of a controller
     * {ChannelEvent.CONTROLLER|string} [data.type=0] Controller type
     * {number} [data.value=127] Controller value
     */
    CONTROLLER: 11,

    /**
     * Change the instrument used on a channel
     * {ChannelEvent.INSTRUMENT|string} [data.instrument=0] Instrument to use
     */
    PROGRAM_CHANGE: 12,

    /**
     * Change the global pressure on a channel
     * {number} [data.pressure=0] Global channel pressure
     */
    CHANNEL_AFTERTOUCH: 13,

    /**
     * Change the pitch on a channel
     * {number} [data.value=0] Pitch bend value (-8192 - 8191)
     */
    PITCH_BEND: 14
});

/**
 * Instruments as defined by the General MIDI standard
 *
 * @readonly
 * @static
 * @enum {number}
 */
ChannelEvent.INSTRUMENT = Object.freeze({
    ACOUSTIC_GRAND_PIANO: 0,
    BRIGHT_ACOUSTIC_PIANO: 1,
    ELECTRIC_GRAND_PIANO: 2,
    HONKY_TONK_PIANO: 3,
    ELECTRIC_PIANO_1: 4,
    ELECTRIC_PIANO_2: 5,
    HARPSICHORD: 6,
    CLAVINET: 7,
    CELESTA: 8,
    GLOCKENSPIEL: 9,
    MUSIC_BOX: 10,
    VIBRAPHONE: 11,
    MARIMBA: 12,
    XYLOPHONE: 13,
    TUBULAR_BELLS: 14,
    DULCIMER: 15,
    DRAWBAR_ORGAN: 16,
    PERCUSSIVE_ORGAN: 17,
    ROCK_ORGAN: 18,
    CHURCH_ORGAN: 19,
    REED_ORGAN: 20,
    ACCORDION: 21,
    HARMONICA: 22,
    TANGO_ACCORDION: 23,
    ACOUSTIC_GUITAR_NYLON: 24,
    ACOUSTIC_GUITAR_STEEL: 25,
    ELECTRIC_GUITAR_JAZZ: 26,
    ELECTRIC_GUITAR_CLEAN: 27,
    ELECTRIC_GUITAR_MUTED: 28,
    OVERDRIVEN_GUITAR: 29,
    DISTORTION_GUITAR: 30,
    GUITAR_HARMONICS: 31,
    ACOUSTIC_BASS: 32,
    ELECTRIC_BASS_FINGER: 33,
    ELECTRIC_BASS_PICK: 34,
    FRETLESS_BASS: 35,
    SLAP_BASS_1: 36,
    SLAP_BASS_2: 37,
    SYNTH_BASS_1: 38,
    SYNTH_BASS_2: 39,
    VIOLIN: 40,
    VIOLA: 41,
    CELLO: 42,
    CONTRABASS: 43,
    TREMOLO_STRINGS: 44,
    PIZZICATO_STRINGS: 45,
    ORCHESTRAL_HARP: 46,
    TIMPANI: 47,
    STRING_ENSEMBLE_1: 48,
    STRING_ENSEMBLE_2: 49,
    SYNTH_STRINGS_1: 50,
    SYNTH_STRINGS_2: 51,
    CHOIR_AAHS: 52,
    VOICE_OOHS: 53,
    SYNTH_CHOIR: 54,
    ORCHESTRA_HIT: 55,
    TRUMPET: 56,
    TROMBONE: 57,
    TUBA: 58,
    MUTED_TRUMPET: 59,
    FRENCH_HORN: 60,
    BRASS_SECTION: 61,
    SYNTH_BRASS_1: 62,
    SYNTH_BRASS_2: 63,
    SOPRANO_SAX: 64,
    ALTO_SAX: 65,
    TENOR_SAX: 66,
    BARITONE_SAX: 67,
    OBOE: 68,
    ENGLISH_HORN: 69,
    BASSOON: 70,
    CLARINET: 71,
    PICCOLO: 72,
    FLUTE: 73,
    RECORDER: 74,
    PAN_FLUTE: 75,
    BLOWN_BOTTLE: 76,
    SHAKUHACHI: 77,
    WHISTLE: 78,
    OCARINA: 79,
    LEAD_1: 80,
    LEAD_2: 81,
    LEAD_3: 82,
    LEAD_4: 83,
    LEAD_5: 84,
    LEAD_6: 85,
    LEAD_7: 86,
    LEAD_8: 87,
    PAD_1: 88,
    PAD_2: 89,
    PAD_3: 90,
    PAD_4: 91,
    PAD_5: 92,
    PAD_6: 93,
    PAD_7: 94,
    PAD_8: 95,
    FX_1: 96,
    FX_2: 97,
    FX_3: 98,
    FX_4: 99,
    FX_5: 100,
    FX_6: 101,
    FX_7: 102,
    FX_8: 103,
    SITAR: 104,
    BANJO: 105,
    SHAMISEN: 106,
    KOTO: 107,
    KALIMBA: 108,
    BAG_PIPE: 109,
    FIDDLE: 110,
    SHANAI: 111,
    TINKLE_BELL: 112,
    AGOGO: 113,
    STEEL_DRUMS: 114,
    WOODBLOCK: 115,
    TAIKO_DRUM: 116,
    MELODIC_TOM: 117,
    SYNTH_DRUM: 118,
    REVERSE_CYMBAL: 119,
    GUITAR_FRET_NOISE: 120,
    BREATH_NOISE: 121,
    SEASHORE: 122,
    BIRD_TWEET: 123,
    TELEPHONE_RING: 124,
    HELICOPTER: 125,
    APPLAUSE: 126,
    GUNSHOT: 127
});

/**
 * Channel controller types
 *
 * @readonly
 * @static
 * @enum {number}
 */
ChannelEvent.CONTROLLER = Object.freeze({
    // two-bytes controllers
    BANK_SELECT_MSB: 0,
    BANK_SELECT_LSB: 32,
    MODULATION_WHEEL_MSB: 1,
    MODULATION_WHEEL_LSB: 33,
    BREATH_MSB: 2,
    BREATH_LSB: 34,
    DATA_ENTRY_MSB: 6,
    DATA_ENTRY_LSB: 38,
    CHANNEL_VOLUME_MSB: 7,
    CHANNEL_VOLUME_LSB: 39,
    BALANCE_MSB: 8,
    BALANCE_LSB: 40,
    PAN_MSB: 10,
    PAN_LSB: 42,
    EXPRESSION_MSB: 11,
    EXPRESSION_LSB: 43,

    // effects
    EFFECT_1_MSB: 12,
    EFFECT_1_LSB: 44,
    EFFECT_2_MSB: 13,
    EFFECT_2_LSB: 45,
    EFFECT_1_DEPTH: 91,
    EFFECT_2_DEPTH: 92,
    EFFECT_3_DEPTH: 93,
    EFFECT_4_DEPTH: 94,
    EFFECT_5_DEPTH: 95,

    // portamento
    PORTAMENTO_TIME_MSB: 5,
    PORTAMENTO_TIME_LSB: 37,
    PORTAMENTO: 65,
    PORTAMENTO_CONTROL: 84,

    // general purpose
    GENERAL_PURPOSE_1_MSB: 16,
    GENERAL_PURPOSE_1_LSB: 48,
    GENERAL_PURPOSE_2_MSB: 17,
    GENERAL_PURPOSE_2_LSB: 49,
    GENERAL_PURPOSE_3_MSB: 18,
    GENERAL_PURPOSE_3_LSB: 50,
    GENERAL_PURPOSE_4_MSB: 19,
    GENERAL_PURPOSE_4_LSB: 51,
    GENERAL_PURPOSE_5: 80,
    GENERAL_PURPOSE_6: 81,
    GENERAL_PURPOSE_7: 82,
    GENERAL_PURPOSE_8: 83,

    // pedals
    FOOT_PEDAL_MSB: 4,
    FOOT_PEDAL_LSB: 36,
    HOLD_PEDAL: 64,
    SOSTENUTO: 66,
    SOFT_PEDAL: 67,
    LEGATO_PEDAL: 68,
    HOLD_2_PEDAL: 69,

    // channel modes
    ALL_SOUND_OFF: 120,
    RESET_ALL: 121,
    LOCAL_CONTROL: 122,
    ALL_NOTES_OFF: 123,
    OMNI_MODE_OFF: 124,
    OMNI_MODE_ON: 125,
    MONO_MODE_ON: 126,
    MONO_MODE_OFF: 127
});

/**
 * @inheritdoc
 * @param {number} type Channel event type
 * @param {number} channel Channel this event applies to
 */
ChannelEvent._decodeInternal = function (buf, delay, type, channel) {
    var data = {};

    buffer.start(buf);

    switch (type) {
    case ChannelEvent.TYPE.NOTE_OFF:
    case ChannelEvent.TYPE.NOTE_ON:
        data.note = buffer.readUIntLE(buf, 1);
        data.velocity = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        data.note = buffer.readUIntLE(buf, 1);
        data.pressure = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        data.type = buffer.readUIntLE(buf, 1);
        data.value = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        data.instrument = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        data.pressure = buffer.readUIntLE(buf, 1);
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        data.value = buffer.readUIntLE(buf, 1) +
            (buffer.readUIntLE(buf, 1) << 7) - 8192;
        break;
    }

    buffer.end(buf);
    return new ChannelEvent(type, data, channel, delay);
};

/**
 * @inheritdoc
 */
ChannelEvent.prototype._encodeInternal = function () {
    var result, buf, value;

    switch (this.type) {
    case ChannelEvent.TYPE.NOTE_OFF:
    case ChannelEvent.TYPE.NOTE_ON:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.note);
        buffer.writeUIntLE(buf, 1, this.data.velocity);
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.note);
        buffer.writeUIntLE(buf, 1, this.data.pressure);
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        buf = new Buffer(2);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.type);
        buffer.writeUIntLE(buf, 1, this.data.value);
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        buf = new Buffer(1);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.instrument);
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        buf = new Buffer(1);
        buffer.start(buf);

        buffer.writeUIntLE(buf, 1, this.data.pressure);
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        buf = new Buffer(2);
        buffer.start(buf);

        value = this.data.value + 8192;
        buffer.writeUIntLE(buf, 1, value & 0x7F);
        buffer.writeUIntLE(buf, 1, value >> 7);
        break;
    }

    result = new Buffer(buf.length + 1);
    buffer.start(result);

    buffer.writeUIntLE(result, 1, (this.type << 4) + this.channel);
    buffer.copy(result, buf);

    buffer.end(result);
    return result;
};
