/**
 * @private
 * @module midijs/lib/file/parser/event
 */

'use strict';

var lastType = null;
var buffer = require('buffer');
var BufferCursor = require('buffercursor');

var MetaEvent = require('../event').MetaEvent;
var SysexEvent = require('../event').SysexEvent;
var ChannelEvent = require('../event').ChannelEvent;

/**
 * Encode an integer as a variable-length integer
 * (up to 4 bytes in big-endian order, if
 * the MSB is set, it means another byte is following).
 *
 * @private
 * @param {Number} value - Integer to encode
 * @return {Buffer} Encoded variable-length integer
 */
function encodeVarInt(value) {
    var bytes = [], cursor, length, i;
    
    do {
        bytes.push(value & 0x7F);
        value >>= 7;
    } while (value > 0);
    
    length = bytes.length;
    cursor = new BufferCursor(new buffer.Buffer(length));
    
    for (i = length - 1; i >= 0; i -= 1) {
        if (i > 0) {
            bytes[i] |= 0x80;
        }
        
        cursor.writeUInt8(bytes[i]);
    }
    
    return cursor.buffer;
}

/**
 * Encode a meta MIDI event
 *
 * @private
 * @param {module:midijs/lib/file/event~MetaEvent} event - Meta event to parse
 * @exception {Error} Failed to parse the meta event
 * @return {Buffer} Encoded meta event
 */
function encodeMetaEvent(event) {
    var length, cursor, eventData, value, rates;
    
    rates = [24, 25, 30, 30];
    
    switch (event.type) {
    case MetaEvent.TYPE.SEQUENCE_NUMBER:
        eventData = new BufferCursor(new buffer.Buffer(2));
        eventData.writeUInt16LE(event.number);
        break;
    case MetaEvent.TYPE.TEXT:
    case MetaEvent.TYPE.COPYRIGHT_NOTICE:
    case MetaEvent.TYPE.SEQUENCE_NAME:
    case MetaEvent.TYPE.INSTRUMENT_NAME:
    case MetaEvent.TYPE.LYRICS:
    case MetaEvent.TYPE.MARKER:
    case MetaEvent.TYPE.CUE_POINT:
        eventData = new BufferCursor(new buffer.Buffer(
            buffer.Buffer.byteLength(event.text, 'ascii')
        ));
        eventData.write(event.text, 'ascii');
        break;
    case MetaEvent.TYPE.CHANNEL_PREFIX:
        eventData = new BufferCursor(new buffer.Buffer(1));
        eventData.writeUInt8(event.channel);
        break;
    case MetaEvent.TYPE.END_OF_TRACK:
        eventData = new BufferCursor(new buffer.Buffer(0));
        break;
    case MetaEvent.TYPE.SET_TEMPO:
        eventData = new BufferCursor(new buffer.Buffer(3));
        value = 60000000 / event.tempo;
        
        eventData.writeUInt8(value >> 16);
        eventData.writeUInt8((value >> 8) & 0xFF);
        eventData.writeUInt8(value & 0xFF);
        break;
    case MetaEvent.TYPE.SMPTE_OFFSET:
        eventData = new BufferCursor(new buffer.Buffer(5));
        
        eventData.writeUInt8(
            (rates.indexOf(event.rate) << 6) + (event.hours & 0x3F)
        );
        eventData.writeUInt8(event.minutes);
        eventData.writeUInt8(event.seconds);
        eventData.writeUInt8(event.frames);
        eventData.writeUInt8(event.subframes);
        break;
    case MetaEvent.TYPE.TIME_SIGNATURE:
        eventData = new BufferCursor(new buffer.Buffer(4));
        
        eventData.writeUInt8(event.numerator);
        eventData.writeUInt8(Math.log(event.denominator) / Math.LN2);
        eventData.writeUInt8(event.metronome);
        eventData.writeUInt8(192 / event.clockSignalsPerBeat);
        break;
    case MetaEvent.TYPE.KEY_SIGNATURE:
        eventData = new BufferCursor(new buffer.Buffer(2));
        
        eventData.writeUInt8(event.note);
        eventData.writeUInt8(+event.major);
        break;
    case MetaEvent.TYPE.SEQUENCER_SPECIFIC:
        eventData = new BufferCursor(new buffer.Buffer(event.data.length));
        eventData.copy(event.data);
        break;
    default:
        throw new Error('Unknown meta event type: "' + event.type + '"');
    }
    
    length = encodeVarInt(eventData.length);
    cursor = new BufferCursor(new buffer.Buffer(
        2 + length.length + eventData.length
    ));
    
    cursor.writeUInt8(0xFF);
    cursor.writeUInt8(event.type);
    cursor.copy(length);
    cursor.copy(eventData.buffer);
    
    return cursor.buffer;
}

/**
 * Encode a system exclusive MIDI event
 *
 * @private
 * @param {module:midijs/lib/file/event~SysexEvent} event - Sysex event to encode
 * @return {Buffer} Encoded sysex event
 */
function encodeSysexEvent(event) {
    var cursor, length;
    
    length = encodeVarInt(event.data.length);
    cursor = new BufferCursor(new buffer.Buffer(
        1 + length.length + event.data.length
    ));
    
    cursor.writeUInt8(0xF0 | event.type);
    cursor.copy(length);
    cursor.copy(event.data);
    
    return cursor.buffer;
}

/**
 * Encode a channel event
 *
 * @private
 * @param {module:midijs/lib/file/event~ChannelEvent} event - Channel event to encode
 * @return {Buffer} Encoded channel event
 */
function encodeChannelEvent(event) {
    var cursor, eventData, value;
    
    switch (event.type) {
    case ChannelEvent.TYPE.NOTE_OFF:
        eventData = new BufferCursor(new buffer.Buffer(2));
        
        eventData.writeUInt8(event.note);
        eventData.writeUInt8(event.velocity);
        break;
    case ChannelEvent.TYPE.NOTE_ON:
        eventData = new BufferCursor(new buffer.Buffer(2));
        
        eventData.writeUInt8(event.note);
        eventData.writeUInt8(event.velocity);
        break;
    case ChannelEvent.TYPE.NOTE_AFTERTOUCH:
        eventData = new BufferCursor(new buffer.Buffer(2));
        
        eventData.writeUInt8(event.note);
        eventData.writeUInt8(event.pressure);
        break;
    case ChannelEvent.TYPE.CONTROLLER:
        eventData = new BufferCursor(new buffer.Buffer(2));
        
        eventData.writeUInt8(event.controller);
        eventData.writeUInt8(event.value);
        break;
    case ChannelEvent.TYPE.PROGRAM_CHANGE:
        eventData = new BufferCursor(new buffer.Buffer(1));
        eventData.writeUInt8(event.program);
        break;
    case ChannelEvent.TYPE.CHANNEL_AFTERTOUCH:
        eventData = new BufferCursor(new buffer.Buffer(1));
        eventData.writeUInt8(event.pressure);
        break;
    case ChannelEvent.TYPE.PITCH_BEND:
        value = event.value + 8192;
        
        eventData = new BufferCursor(new buffer.Buffer(2));
        eventData.writeUInt8(value & 0x7F);
        eventData.writeUInt8(value >> 7);
        break;
    }
    
    cursor = new BufferCursor(new buffer.Buffer(
        1 + eventData.length
    ));
    
    cursor.writeUInt8((event.type << 4) + event.channel);
    cursor.copy(eventData.buffer);
    
    return cursor.buffer;
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
 * Encode a MIDI event
 *
 * @param {module:midijs/lib/file/event~Event} event - Event to encode
 * @exception {Error} Unknown event encountered
 * @return {Buffer} Encoded event
 */
function encodeEvent(event) {
    var delay, eventData, cursor;
    
    delay = encodeVarInt(event.delay);
    
    if (event instanceof MetaEvent) {
        eventData = encodeMetaEvent(event);
    } else if (event instanceof SysexEvent) {
        eventData = encodeSysexEvent(event);
    } else if (event instanceof ChannelEvent) {
        eventData = encodeChannelEvent(event);
    } else {
        throw new Error('Unknown event type');
    }
    
    // if current type is the same as the last one,
    // we don't include it
    // (sysex events cancel the running status and
    //  meta events ignore it)
    if (event instanceof ChannelEvent) {
        if (lastType === eventData[0]) {
            eventData = eventData.slice(1);
        } else {
            lastType = eventData[0];
        }
    } else if (event instanceof SysexEvent) {
        lastType = null;
    }
    
    cursor = new BufferCursor(new buffer.Buffer(
        delay.length + eventData.length
    ));
    
    cursor.copy(delay);
    cursor.copy(eventData);
    
    return cursor.buffer;
}

exports.encodeEvent = encodeEvent;
exports.resetRunningStatus = resetRunningStatus;
