/**
 * Invalid MIDI file
 * 
 * A script to generate malformed MIDI files
 * for testing error handling
 * 
 * Here, we doesn't use the normal encoding
 * algorithm that would trigger an event, but we
 * emulate it by calling independent parts of it
 * 
 * Use the 'undefined' argument to generate an undefined event
 * Use the 'unknown' argument to generate an unknown event
 * Use the 'meta' argument to generate an invalid meta event
 */

'use strict';

var fs = require('fs');
var buffer = require('buffer');

var MIDI = require('../../index');
var encodeHeader = require('../../lib/file/encoder/header').encodeHeader;
var encodeEvent = require('../../lib/file/encoder/event').encodeEvent;
var encodeChunk = require('../../lib/file/encoder/chunk').encodeChunk;
var File = MIDI.File;

var MetaEvent = File.MetaEvent;
var SysexEvent = File.SysexEvent;
var ChannelEvent = File.ChannelEvent;

var type = (process.argv[2] || 'meta').toLowerCase();
var header, events, data, i, length;

events = [
    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NUMBER, {
        number: 0
    }),
    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NAME, {
        text: 'Meta track'
    }),
    new MetaEvent(MetaEvent.TYPE.COPYRIGHT_NOTICE, {
        text: '© 2015, Mattéo DELABRE'
    }),
    new MetaEvent(MetaEvent.TYPE.TEXT, {
        text: 'A fixture for testing all types of MIDI events in one file'
    }),
    new MetaEvent(MetaEvent.TYPE.TIME_SIGNATURE, {
        numerator: 2,
        denominator: 4,
        metronome: 24,
        clockSignalsPerBeat: 8
    }),
    new MetaEvent(MetaEvent.TYPE.KEY_SIGNATURE, {
        major: false,
        note: 3
    }),
    new MetaEvent(MetaEvent.TYPE.SEQUENCER_SPECIFIC, {
        data: new buffer.Buffer('just testing out')
    }),
    
    new MetaEvent(MetaEvent.TYPE.SET_TEMPO, {
        tempo: 240
    }),
    new MetaEvent(MetaEvent.TYPE.SET_TEMPO, {
        tempo: 480
    }, 600)
];

length = events.length;

for (i = 0; i < length; i += 1) {
    events[i] = encodeEvent(events[i]).data;
}

// add the invalid event
switch (type) {
    case 'undefined':
        events.unshift(new Buffer([0x00, 0x7, 0x42, 0x42]));
        break;
    case 'unknown':
        events.push(new Buffer([0x00, 0xF3, 0x13, 0x37]));
        break;
    default:
        type = 'meta';
        events.push(new Buffer([0x00, 0xFF, 0x30, 0x00]));
        break;
}

// fake header
header = (new File())._header;
header._trackCount = 1;

data = buffer.Buffer.concat([
    encodeHeader(header),
    encodeChunk('MTrk', buffer.Buffer.concat(events))
]);

// save the file
fs.writeFile('file-invalid-' + type + '.mid', data, function (err) {
    if (err) {
        throw err;
    }
    
    console.log('file written');
});
