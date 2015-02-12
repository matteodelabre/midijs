'use strict';

var lastType = null;
var MetaEvent = require('../event').MetaEvent;
var SysexEvent = require('../event').SysexEvent;
var ChannelEvent = require('../event').ChannelEvent;

/**
 * Parse a variable-length integer
 * (up to 4 bytes in big-endian order, if
 * the MSB is set, it means another byte is following).
 *
 * @private
 * @param {BufferCursor} cursor - Buffer to read
 * @return {Number} Parsed integer
 */
function parseVarInt(cursor) {
    var result = 0, byte;
    
    do {
        byte = cursor.readUInt8();
        result = (result << 7) + (byte & 0x7f);
    } while (byte & 0x80);
    
    return result;
}

/**
 * Parse a meta MIDI event
 *
 * @private
 * @param {Number} delay - Event delay in ticks
 * @param {BufferCursor} cursor - Buffer to parse
 * @exception {Error} Failed to parse the meta event
 * @return {MetaEvent} Parsed meta event
 */
function parseMetaEvent(delay, cursor) {
    var type, specs = {}, length, value, rates;
    
    rates = [24, 25, 30, 30];
    type = cursor.readUInt8();
    length = parseVarInt(cursor);
    
    switch (type) {
    case 0:
        type = 'sequenceNumber';
        specs.number = cursor.readUInt16LE();
        break;
    case 1:
        type = 'text';
        specs.text = cursor.toString('ascii', length);
        break;
    case 2:
        type = 'copyrightNotice';
        specs.text = cursor.toString('ascii', length);
        break;
    case 3:
        type = 'sequenceName';
        specs.text = cursor.toString('ascii', length);
        break;
    case 4:
        type = 'instrumentName';
        specs.text = cursor.toString('ascii', length);
        break;
    case 5:
        type = 'lyrics';
        specs.text = cursor.toString('ascii', length);
        break;
    case 6:
        type = 'marker';
        specs.text = cursor.toString('ascii', length);
        break;
    case 7:
        type = 'cuePoint';
        specs.text = cursor.toString('ascii', length);
        break;
    case 32:
        type = 'channelPrefix';
        specs.channel = cursor.readUInt8();
        break;
    case 47:
        type = 'endOfTrack';
        break;
    case 81:
        type = 'setTempo';
        specs.tempo = 60000000 / ((cursor.readUInt8() << 16) +
                      (cursor.readUInt8() << 8) +
                       cursor.readUInt8());
        break;
    case 84:
        type = 'smpteOffset';
        value = cursor.readUInt8();
        
        specs.rate = rates[value >> 6];
        specs.hours = value & 0x3F;
        specs.minutes = cursor.readUInt8();
        specs.seconds = cursor.readUInt8();
        specs.frames = cursor.readUInt8();
        specs.subframes = cursor.readUInt8();
        break;
    case 88:
        type = 'timeSignature';
        specs.numerator = cursor.readUInt8();
        specs.denominator = Math.pow(2, cursor.readUInt8());
        specs.metronome = cursor.readUInt8();
        specs.clockSignalsPerBeat = (192 / cursor.readUInt8());
        break;
    case 89:
        type = 'keySignature';
        specs.note = cursor.readInt8();
        specs.major = !cursor.readUInt8();
        break;
    case 127:
        type = 'sequencerSpecific';
        specs.data = cursor.slice(length).buffer;
        break;
    default:
        throw new Error('Unknown meta event type: "' + type + '"');
    }
    
    return new MetaEvent(type, specs, delay);
}

/**
 * Parse a system exclusive MIDI event
 *
 * @private
 * @param {Number} delay - Event delay in ticks
 * @param {Number} type - Sysex type
 * @param {BufferCursor} cursor - Buffer to parse
 * @return {SysexEvent} Parsed sysex event
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
 * @param {BufferCursor} cursor - Buffer to parse
 * @return {ChannelEvent} Parsed channel event
 */
function parseChannelEvent(delay, type, channel, cursor) {
    var specs = {};
    
    switch (type) {
    case 8:
        type = 'noteOff';
        specs.note = cursor.readUInt8();
        specs.velocity = cursor.readUInt8();
        break;
    case 9:
        type = 'noteOn';
        specs.note = cursor.readUInt8();
        specs.velocity = cursor.readUInt8();
        break;
    case 10:
        type = 'noteAftertouch';
        specs.note = cursor.readUInt8();
        specs.pressure = cursor.readUInt8();
        break;
    case 11:
        type = 'controller';
        specs.controller = cursor.readUInt8();
        specs.value = cursor.readUInt8();
        break;
    case 12:
        type = 'programChange';
        specs.program = cursor.readUInt8();
        break;
    case 13:
        type = 'channelAftertouch';
        specs.pressure = cursor.readUInt8();
        break;
    case 14:
        type = 'pitchBend';
        specs.value = cursor.readUInt8() +
            (cursor.readUInt8() << 7) - 8192;
        break;
    }
    
    return new ChannelEvent(type, channel, specs, delay);
}

/**
 * Parse a MIDI event
 *
 * @param {BufferCursor} cursor - Buffer to parse
 * @exception {Error} Unknown event encountered
 * @return {MetaEvent|SysexEvent|ChannelEvent} Parsed event
 */
function parseEvent(cursor) {
    var delay, type, result;

    delay = parseVarInt(cursor);
    type = cursor.readUInt8();
    
    // if the most significant bit is not set,
    // we use the last status
    if ((type & 0x80) === 0) {
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
        throw new Error('Unknown event type "' + type + '"');
    }
    
    return result;
}

exports.parseEvent = parseEvent;
