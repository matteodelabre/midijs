/**
 * @private
 * @module midijs/lib/file/parser/event
 */

'use strict';

var lastType = null;

var error = require('../../error');
var MetaEvent = require('../event').MetaEvent;
var SysexEvent = require('../event').SysexEvent;
var ChannelEvent = require('../event').ChannelEvent;

/**
 * Parse a variable-length integer
 * (up to 4 bytes in big-endian order, if
 * the MSB is set, it means another byte is following).
 *
 * @private
 * @param {module:buffercursor} cursor - Buffer to read
 * @return {Number} Parsed integer
 */
function parseVarInt(cursor) {
    var result = 0, byte;
    
    do {
        byte = cursor.readUInt8();
        
        result <<= 7;
        result |= byte & 0x7F;
    } while (byte & 0x80);
    
    return result;
}

/**
 * Parse a meta MIDI event
 *
 * @private
 * @param {Number} delay - Event delay in ticks
 * @param {module:buffercursor} cursor - Buffer to parse
 * @exception {Error} Failed to parse the meta event
 * @return {module:midijs/lib/file/event~MetaEvent} Parsed meta event
 */
function parseMetaEvent(delay, cursor) {
    var type, specs = {}, length, value, rates;
    
    rates = [24, 25, 30, 30];
    type = cursor.readUInt8();
    length = parseVarInt(cursor);
    
    switch (type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        specs.number = cursor.readUInt16LE();
        break;
    case MetaEvent.TYPE.TEXT:
    case MetaEvent.TYPE.COPYRIGHT_NOTICE:
    case MetaEvent.TYPE.SEQUENCE_NAME:
    case MetaEvent.TYPE.INSTRUMENT_NAME:
    case MetaEvent.TYPE.LYRICS:
    case MetaEvent.TYPE.MARKER:
    case MetaEvent.TYPE.CUE_POINT:
        specs.text = cursor.toString('utf8', length);
        break;
    case MetaEvent.TYPE.CHANNEL_PREFIX:
        specs.channel = cursor.readUInt8();
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        specs.tempo = 60000000 / ((cursor.readUInt8() << 16) +
                      (cursor.readUInt8() << 8) +
                       cursor.readUInt8());
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        value = cursor.readUInt8();
        
        specs.rate = rates[value >> 6];
        specs.hours = value & 0x3F;
        specs.minutes = cursor.readUInt8();
        specs.seconds = cursor.readUInt8();
        specs.frames = cursor.readUInt8();
        specs.subframes = cursor.readUInt8();
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        specs.numerator = cursor.readUInt8();
        specs.denominator = Math.pow(2, cursor.readUInt8());
        specs.metronome = cursor.readUInt8();
        specs.clockSignalsPerBeat = (192 / cursor.readUInt8());
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        specs.note = cursor.readInt8();
        specs.major = !cursor.readUInt8();
        break;
    case MetaEvent.TYPE.SEQUENCER_SPECIFIC:
        specs.data = cursor.slice(length).buffer;
        break;
    default:
        throw new error.MIDIFileParserError(
            type,
            'known MetaEvent type',
            cursor.tell()
        );
    }
    
    return new MetaEvent(type, specs, delay);
}

/**
 * Parse a system exclusive MIDI event
 *
 * @private
 * @param {Number} delay - Event delay in ticks
 * @param {Number} type - Sysex type
 * @param {module:buffercursor} cursor - Buffer to parse
 * @return {module:midijs/lib/file/event~SysexEvent} Parsed sysex event
 */
function parseSysexEvent(delay, type, cursor) {
    var data, length = parseVarInt(cursor);
    
    data = cursor.slice(length).buffer;
    return new SysexEvent(type, data, delay);
}

/**
 * Parse a channel event
 *
 * @private
 * @param {Number} delay - Event delay in ticks
 * @param {Number} type - Event subtype
 * @param {Number} channel - Channel number
 * @param {module:buffercursor} cursor - Buffer to parse
 * @return {module:midijs/lib/file/event~ChannelEvent} Parsed channel event
 */
function parseChannelEvent(delay, type, channel, cursor) {
    var specs = {};
    
    switch (type) {
    case ChannelEvent.TYPE.NOTE_OFF:
        specs.note = cursor.readUInt8();
        specs.velocity = cursor.readUInt8();
        break;
    case ChannelEvent.TYPE.NOTE_ON:
        specs.note = cursor.readUInt8();
        specs.velocity = cursor.readUInt8();
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        specs.note = cursor.readUInt8();
        specs.pressure = cursor.readUInt8();
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        specs.controller = cursor.readUInt8();
        specs.value = cursor.readUInt8();
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        specs.program = cursor.readUInt8();
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        specs.pressure = cursor.readUInt8();
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        specs.value = cursor.readUInt8() +
            (cursor.readUInt8() << 7) - 8192;
        break;
    }
    
    return new ChannelEvent(type, specs, channel, delay);
}

/**
 * Reset the running status
 *
 * @return {void}
 */
function resetRunningStatus() {
    lastType = null;
}

/**
 * Parse a MIDI event
 *
 * @param {BufferCursor} cursor - Buffer to parse
 * @exception {Error} Unknown event encountered
 * @return {module:midijs/lib/file/event~Event} Parsed event
 */
function parseEvent(cursor) {
    var delay, type, result;

    delay = parseVarInt(cursor);
    type = cursor.readUInt8();
    
    // if the most significant bit is not set,
    // we use the last status
    if ((type & 0x80) === 0) {
        if (lastType === null) {
            throw new error.MIDIFileParserError(
                'undefined event type (0x' + type.toString(16) + ')',
                'first event with defined type',
                cursor.tell()
            );
        }
        
        type = lastType;
        cursor.seek(cursor.tell() - 1);
    } else {
        lastType = type;
    }
    
    if (type === 0xFF) {
        result = parseMetaEvent(delay, cursor);
    } else if (type > 0xEF) {
        result = parseSysexEvent(delay, type & 0xF, cursor);
    } else if (type >= 0x80) {
        result = parseChannelEvent(delay, type >> 4, type & 0xF, cursor);
    } else {
        throw new error.MIDIFileParserError(
            type,
            'known event type',
            cursor.tell()
        );
    }
    
    return result;
}

exports.parseEvent = parseEvent;
exports.resetRunningStatus = resetRunningStatus;
