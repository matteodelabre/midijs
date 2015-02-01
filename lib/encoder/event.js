/*jslint node:true, browser:true, bitwise:true */

'use strict';

var lastType = null;

/**
 * Read a variable-length integer
 * (up to 4 bytes in big-endian order, if
 * the MSB is set, it means another byte is following).
 *
 * @private
 * @param {cursor: BufferCursor}    Buffer to read
 * @return int
 */
function readVarInt(cursor) {
    var result = 0, byte;
    
    do {
        byte = cursor.readUInt8();
        result = (result << 7) + (byte & 0x7f);
    } while (byte & 0x80);
    
    return result;
}

/**
 * EventMeta
 *
 * Parse a meta MIDI event
 *
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function EventMeta(cursor) {
    var subtype, length;
    
    this.type = 'meta';
    
    subtype = cursor.readUInt8();
    length = readVarInt(cursor);
    
    switch (subtype) {
    case 0:
        this.subtype = 'sequenceNumber';
        this.number = cursor.readUInt16LE();
        break;
    case 1:
        this.subtype = 'text';
        this.text = cursor.toString('ascii', length);
        break;
    case 2:
        this.subtype = 'copyrightNotice';
        this.text = cursor.toString('ascii', length);
        break;
    case 3:
        this.subtype = 'sequenceName';
        this.text = cursor.toString('ascii', length);
        break;
    case 4:
        this.subtype = 'instrumentName';
        this.text = cursor.toString('ascii', length);
        break;
    case 5:
        this.subtype = 'lyrics';
        this.text = cursor.toString('ascii', length);
        break;
    case 6:
        this.subtype = 'marker';
        this.text = cursor.toString('ascii', length);
        break;
    case 7:
        this.subtype = 'cuePoint';
        this.text = cursor.toString('ascii', length);
        break;
    case 32:
        this.subtype = 'channelPrefix';
        this.channel = cursor.readUInt8();
        break;
    case 47:
        this.subtype = 'endOfTrack';
        break;
    case 81:
        this.subtype = 'setTempo';
        this.tempo = ((cursor.readUInt8() << 16) +
                      (cursor.readUInt8() << 8) +
                       cursor.readUInt8());
        break;
    case 84:
        throw new Error('Expressing time in SMTPE format is not supported');
    case 88:
        this.subtype = 'timeSignature';
        this.numerator = cursor.readUInt8();
        this.denominator = Math.pow(2, cursor.readUInt8());
        this.metronome = cursor.readUInt8();
        this.clockSignalsPerBeat = (192 / cursor.readUInt8());
        break;
    case 89:
        this.subtype = 'keySignature';
        this.note = cursor.readInt8();
        this.major = !cursor.readUInt8();
        break;
    case 127:
        this.subtype = 'sequencerSpecific';
        this.data = cursor.slice(length).buffer;
        break;
    }
}

/**
 * EventSysex
 *
 * Parse a system exclusive MIDI event
 *
 * @param {subtype: int}            Event subtype
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function EventSysex(subtype, cursor) {
    var length = readVarInt(cursor);
    
    this.type = 'sysex';
    this.subtype = subtype;
    this.data = cursor.slice(length).buffer;
}

/**
 * EventChannel
 *
 * @param {subtype: int}            Event subtype
 * @param {channel: int}            Channel number
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function EventChannel(subtype, channel, cursor) {
    this.type = 'channel';
    this.channel = channel;
    
    switch (subtype) {
    case 8:
        this.subtype = 'noteOff';
        this.note = cursor.readUInt8();
        this.velocity = cursor.readUInt8();
        break;
    case 9:
        this.subtype = 'noteOn';
        this.note = cursor.readUInt8();
        this.velocity = cursor.readUInt8();
        break;
    case 10:
        this.subtype = 'noteAftertouch';
        this.note = cursor.readUInt8();
        this.pressure = cursor.readUInt8();
        break;
    case 11:
        this.subtype = 'controller';
        this.controller = cursor.readUInt8();
        this.value = cursor.readUInt8();
        break;
    case 12:
        this.subtype = 'programChange';
        this.program = cursor.readUInt8();
        break;
    case 13:
        this.subtype = 'channelAftertouch';
        this.pressure = cursor.readUInt8();
        break;
    case 14:
        this.subtype = 'pitchBend';
        this.value = cursor.readUInt8() +
            (cursor.readUInt8() << 7) - 8192;
        break;
    }
}

/**
 * Event
 *
 * Parse a MIDI event
 *
 * @param {cursor: BufferCursor}    Buffer to parse
 */
function Event(cursor) {
    var delay, type, result;

    delay = readVarInt(cursor);
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
        result = new EventMeta(cursor);
    } else if (type > 0xEF) {
        result = new EventSysex(type & 0xF, cursor);
    } else if (type >= 0x80) {
        result = new EventChannel(type >> 4, type & 0xF, cursor);
    } else {
        throw new Error('Unknown event type "' + type + '"');
    }
    
    result.delay = delay;
    return result;
}

exports.EventMeta = EventMeta;
exports.EventSysex = EventSysex;
exports.EventChannel = EventChannel;
exports.Event = Event;