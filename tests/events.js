'use strict';

/**
 * @overview Test suite for MIDI events
 */

var test = require('tape');
var bufferEqual = require('./util/buffer-equal');

var events = require('../').events;
var Event = events.Event;
var MetaEvent = events.MetaEvent;
var SysexEvent = events.SysexEvent;
var ChannelEvent = events.ChannelEvent;

// var MalformedError = require('../lib/util/errors').MalformedError;

test('Encoding and decoding meta events', function (assert) {
    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x00, 2, 0, 1]),
        new MetaEvent('sequence number', {
            number: 1
        }).encode(),
        'should encode sequence number');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x01, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('text', {
            text: 'MIDI'
        }).encode(),
        'should encode text');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x02, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('copyright notice', {
            text: 'MIDI'
        }).encode(),
        'should encode copyright notice');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x03, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('sequence name', {
            text: 'MIDI'
        }).encode(),
        'should encode sequence name');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x04, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('instrument name', {
            text: 'MIDI'
        }).encode(),
        'should encode instrument name');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x05, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('lyrics', {
            text: 'MIDI'
        }).encode(),
        'should encode lyrics');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x06, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('marker', {
            text: 'MIDI'
        }).encode(),
        'should encode marker');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x07, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('cue point', {
            text: 'MIDI'
        }).encode(),
        'should encode cue point');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x08, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('program name', {
            text: 'MIDI'
        }).encode(),
        'should encode program name');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x09, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('device name', {
            text: 'MIDI'
        }).encode(),
        'should encode device name');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x2F, 0]),
        new MetaEvent('end of track').encode(),
        'should encode end of track');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x51, 3, 0x07, 0xA1, 0x20]),
        new MetaEvent('set tempo', {
            tempo: 120
        }).encode(),
        'should encode tempo');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x54, 5, 12, 20, 30, 21, 56]),
        new MetaEvent('smpte offset', {
            rate: 24,
            hours: 12,
            minutes: 20,
            seconds: 30,
            frames: 21,
            subframes: 56
        }).encode(),
        'should encode smpte offset');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x58, 4, 2, 3, 21, 8]),
        new MetaEvent('time signature', {
            numerator: 2,
            denominator: 8,
            metronome: 21
        }).encode(),
        'should encode time signature');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x59, 2, 0xfc, 0x00]),
        new MetaEvent('key signature', {
            note: -4,
            major: true
        }).encode(),
        'should encode key signature');

    bufferEqual(assert,
        new Buffer([0x00, 0xFF, 0x74, 2, 13, 37]),
        new MetaEvent(0x74, {
            bytes: new Buffer([13, 37])
        }).encode(),
        'should encode other kinds');

    assert.ok(
        Event.decode(new Buffer([0x00, 0xFF, 0x00, 2, 0, 1])) instanceof
        MetaEvent, 'should decode meta events'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x00, 2, 0, 1])).type,
        MetaEvent.TYPE.SEQUENCE_NUMBER,
        'should decode sequence number'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x00, 2, 0, 1])).data,
        {
            number: 1
        },
        'should decode sequence number data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x01, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.TEXT,
        'should decode text'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x01, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode text data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x02, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.COPYRIGHT_NOTICE,
        'should decode copyright notice'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x02, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode copyright notice data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x03, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.SEQUENCE_NAME,
        'should decode sequence name'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x03, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode sequence name data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x04, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.INSTRUMENT_NAME,
        'should decode instrument name'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x04, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode instrument name data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x05, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.LYRICS,
        'should decode lyrics'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x05, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode lyrics data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x06, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.MARKER,
        'should decode marker'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x06, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode marker data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x07, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.CUE_POINT,
        'should decode cue point'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x07, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode cue point data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x08, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.PROGRAM_NAME,
        'should decode program name'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x08, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode program name data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x09, 4, 0x4d, 0x49, 0x44, 0x49])).type,
        MetaEvent.TYPE.DEVICE_NAME,
        'should decode device name'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x09, 4, 0x4d, 0x49, 0x44, 0x49])).data,
        {
            text: 'MIDI'
        },
        'should decode device name data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x2F, 0])).type,
        MetaEvent.TYPE.END_OF_TRACK,
        'should decode end of track'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x51, 3, 0x07, 0xA1, 0x20])).type,
        MetaEvent.TYPE.SET_TEMPO,
        'should decode tempo'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x51, 3, 0x07, 0xA1, 0x20])).data,
        {
            tempo: 120
        },
        'should decode tempo data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x54, 5, 12, 20, 30, 21, 56])).type,
        MetaEvent.TYPE.SMPTE_OFFSET,
        'should decode smpte offset'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x54, 5, 12, 20, 30, 21, 56])).data,
        {
            rate: 24,
            hours: 12,
            minutes: 20,
            seconds: 30,
            frames: 21,
            subframes: 56
        },
        'should decode smpte offset data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x58, 4, 2, 3, 21, 8])).type,
        MetaEvent.TYPE.TIME_SIGNATURE,
        'should decode time signature'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x58, 4, 2, 3, 21, 8])).data,
        {
            numerator: 2,
            denominator: 8,
            metronome: 21,
            notated32ndsPerMIDIBeat: 8
        },
        'should decode time signature data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x59, 2, 0xfc, 0x00])).type,
        MetaEvent.TYPE.KEY_SIGNATURE,
        'should decode key signature'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xFF, 0x59, 2, 0xfc, 0x00])).data,
        {
            note: -4,
            major: true
        },
        'should decode key signature data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x74, 2, 13, 37])).type, 0x74,
        'should decode other kinds'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xFF, 0x74, 2, 13, 37])).unknown, true,
        'should set unknown flags for other kinds'
    );

    bufferEqual(assert,
        Event.decode(new Buffer([0x00, 0xFF, 0x74, 2, 13, 37])).data.bytes,
        new Buffer([13, 37]),
        'should decode other kinds\' data');

    assert.end();
});

test('Encoding and decoding sysex events', function (assert) {
    bufferEqual(assert,
        new Buffer([0x00, 0xF0, 3, 0xa, 0xb, 0xc]),
        new SysexEvent(
            'type 1', new Buffer([0xa, 0xb, 0xc])
        ).encode(),
        'should encode sysex events');

    assert.equal(
        Event.decode(new Buffer([0x00, 0xF7, 3, 0x1, 0x2, 0x3])).type,
        SysexEvent.TYPE.TYPE_2,
        'should decode sysex events'
    );

    bufferEqual(assert,
        Event.decode(new Buffer([0x00, 0xF7, 3, 0x1, 0x2, 0x3])).data,
        new Buffer([0x1, 0x2, 0x3]),
        'should decode sysex events data');

    assert.end();
});

test('Encoding and decoding channel events', function (assert) {
    bufferEqual(assert,
        new Buffer([0x00, 0x80, 0, 120]),
        new ChannelEvent('note off', {
            note: 0,
            velocity: 120
        }).encode(),
        'should encode note off');

    bufferEqual(assert,
        new Buffer([0x00, 0x80, 60, 127]),
        new ChannelEvent('note off', {
            note: 'C'
        }).encode(),
        'should encode note off with shortcuts');

    bufferEqual(assert,
        new Buffer([0x00, 0x91, 0, 120]),
        new ChannelEvent('note on', {
            note: 0,
            velocity: 120
        }, 1).encode(),
        'should encode note on');

    bufferEqual(assert,
        new Buffer([0x00, 0x91, 60, 127]),
        new ChannelEvent('note on', {
            note: 'C'
        }, 1).encode(),
        'should encode note on with shortcuts');

    bufferEqual(assert,
        new Buffer([0x00, 0xA0, 0, 120]),
        new ChannelEvent('note aftertouch', {
            note: 0,
            pressure: 120
        }).encode(),
        'should encode note aftertouch');

    bufferEqual(assert,
        new Buffer([0x00, 0xA0, 60, 127]),
        new ChannelEvent('note aftertouch', {
            note: 'C'
        }).encode(),
        'should encode note aftertouch with shortcuts');

    bufferEqual(assert,
        new Buffer([0x00, 0xB0, 0, 63]),
        new ChannelEvent('controller', {
            type: 0,
            value: 63
        }).encode(),
        'should encode controller');

    bufferEqual(assert,
        new Buffer([0x00, 0xB0, 64, 127]),
        new ChannelEvent('controller', {
            type: 'hold pedal'
        }).encode(),
        'should encode controller with shortcuts');

    bufferEqual(assert,
        new Buffer([0x00, 0xC3, 2]),
        new ChannelEvent('program change', {
            instrument: 2
        }, 3).encode(),
        'should encode program change');

    bufferEqual(assert,
        new Buffer([0x00, 0xC3, 19]),
        new ChannelEvent('program change', {
            instrument: 'church organ'
        }, 3).encode(),
        'should encode program change with shortcuts');

    bufferEqual(assert,
        new Buffer([0x00, 0xD0, 24]),
        new ChannelEvent('channel aftertouch', {
            pressure: 24
        }).encode(),
        'should encode channel aftertouch');

    bufferEqual(assert,
        new Buffer([
            0x00, 0xE0,
            parseInt('0111000', 2), parseInt('111110', 2)
            // => 1111100111000
            // => 7992
            // => -200 tones
        ]),
        new ChannelEvent('pitch bend', {
            value: -200
        }).encode(),
        'should encode pitch bend');

    assert.ok(
        Event.decode(new Buffer([0x00, 0xC0, 0])) instanceof ChannelEvent,
        'should decode channel events'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0x85, 0, 120])).channel, 5,
        'should decode channel number'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0x80, 0, 120])).type,
        ChannelEvent.TYPE.NOTE_OFF,
        'should decode note off'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0x80, 0, 120])).data,
        {
            note: 0,
            velocity: 120
        },
        'should decode note off data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0x90, 0, 127])).type,
        ChannelEvent.TYPE.NOTE_ON,
        'should decode note on'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0x90, 0, 127])).data,
        {
            note: 0,
            velocity: 127
        },
        'should decode note on data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xA0, 0, 120])).type,
        ChannelEvent.TYPE.NOTE_AFTERTOUCH,
        'should decode note aftertouch'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xA0, 0, 120])).data,
        {
            note: 0,
            pressure: 120
        },
        'should decode note aftertouch data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xB0, 0, 63])).type,
        ChannelEvent.TYPE.CONTROLLER,
        'should decode controller'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xB0, 0, 63])).data,
        {
            type: 0,
            value: 63
        },
        'should decode controller data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xC0, 2])).type,
        ChannelEvent.TYPE.PROGRAM_CHANGE,
        'should decode program change'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xC0, 2])).data,
        {
            instrument: 2
        },
        'should decode program change data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xD0, 24])).type,
        ChannelEvent.TYPE.CHANNEL_AFTERTOUCH,
        'should decode channel aftertouch'
    );

    assert.deepEqual(
        Event.decode(new Buffer([0x00, 0xD0, 24])).data,
        {
            pressure: 24
        },
        'should decode channel aftertouch data'
    );

    assert.equal(
        Event.decode(new Buffer([0x00, 0xE0, 56, 62])).type,
        ChannelEvent.TYPE.PITCH_BEND,
        'should decode pitch bend'
    );

    assert.deepEqual(
        Event.decode(new Buffer([
            0x00, 0xE0,
            parseInt('0111000', 2), parseInt('111110', 2)
            // => 1111100111000
            // => 7992
            // => -200 tones
        ])).data,
        {
            value: -200
        },
        'should decode pitch bend data'
    );

    assert.end();
});
