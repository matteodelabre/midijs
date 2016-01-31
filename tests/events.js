'use strict';

/**
 * @overview Test suite for MIDI events
 */

var test = require('tape');
var bufferEqual = require('./util/buffer-equal');

var MIDIBuffer = require('../lib/util/buffer');
var events = require('../').events;
var Context = events.Context;
var MetaEvent = events.MetaEvent;
var SysexEvent = events.SysexEvent;
var ChannelEvent = events.ChannelEvent;

test('Creating event context', function (assert) {
    var ctx = new Context();

    assert.deepEqual(ctx.options, {
        device: false,
        runningStatus: {
            in: true,
            out: true
        }
    }, 'should have defaults');

    ctx = new Context({
        runningStatus: false
    });

    assert.deepEqual(ctx.options.runningStatus, {
        in: false,
        out: false
    }, 'should propagate running status setting');

    assert.end();
});

test('Encoding and decoding events with event context', function (assert) {
    var ctx = new Context({
        runningStatus: false
    }), event = new ChannelEvent('note on', {
        note: 'C#',
        velocity: 63
    }, 5, 200), data = new Buffer([0x81, 0x48, 0x95, 61, 63]);

    bufferEqual(assert, event.encode().toBuffer(), ctx.encode(event).slice(2),
        'should work like SomeEvent.encode()');

    assert.equal(
        ctx.decode(data)[0].channel,
        ChannelEvent.decode(200, 0x95, new MIDIBuffer(data.slice(3))).channel,
        'should decode channels correctly');

    assert.equal(
        ctx.decode(data)[0].type,
        ChannelEvent.decode(200, 0x95, new MIDIBuffer(data.slice(3))).type,
        'should decode types correctly');

    assert.deepEqual(
        ctx.decode(data)[0].data,
        ChannelEvent.decode(200, 0x95, new MIDIBuffer(data.slice(3))).data,
        'should decode data correctly');

    assert.end();
});

test('Context device mode', function (assert) {
    var ctx = new Context({
        device: true
    }), event = new ChannelEvent('note on', {
        note: 'C#',
        velocity: 63
    }, 5, 200), data = new Buffer([0x95, 61, 63]);

    assert.equal(ctx.options.runningStatus.in, true,
        'should accept incoming running status in device mode');
    assert.equal(ctx.options.runningStatus.out, false,
        'should not produce running statuses in device mode');

    assert.ok(Array.isArray(ctx.encode(event)), 'should encode to array');
    assert.deepEqual(ctx.encode(event), [0x95, 61, 63],
        'should not encode delays');

    assert.equal(
        ctx.decode(data)[0].channel,
        ChannelEvent.decode(0, 0x95, new MIDIBuffer(data.slice(1))).channel,
        'should decode channels correctly');

    assert.equal(
        ctx.decode(data)[0].type,
        ChannelEvent.decode(0, 0x95, new MIDIBuffer(data.slice(1))).type,
        'should decode types correctly');

    assert.deepEqual(
        ctx.decode(data)[0].data,
        ChannelEvent.decode(0, 0x95, new MIDIBuffer(data.slice(1))).data,
        'should decode data correctly');

    assert.end();
});

test('Context running status', function (assert) {
    var ctx = new Context({
        device: true,
        runningStatus: true
    }), rs1 = new Buffer([0x90, 60, 127]),
        rs2 = new Buffer([60, 0]),
        rs = Buffer.concat([rs1, rs2]);

    assert.ok(ctx.decode(rs).length === 2, 'should decode several events');
    ctx.reset();

    assert.deepEqual(ctx.encode([
        new ChannelEvent('note on'),
        new ChannelEvent('note off')
    ]), [0x90, 60, 127, 0x80, 60, 127], 'should encode several events');
    ctx.reset();

    bufferEqual(assert, rs, ctx.encode([
        new ChannelEvent('note on'),
        new ChannelEvent('note on', {
            velocity: 0
        })
    ]), 'should take advantage of running status');
    ctx.reset();

    bufferEqual(assert, ctx.encode(
        new ChannelEvent('note on')
    ), rs1, 'should work with separate calls');

    bufferEqual(assert, ctx.encode(
        new ChannelEvent('note on', {
            velocity: 0
        })
    ), rs2, 'should work with separate calls');

    assert.end();
});

test('Encoding and decoding meta events', function (assert) {
    bufferEqual(assert,
        new Buffer([0xFF, 0x00, 2, 0, 1]),
        new MetaEvent('sequence number', {
            number: 1
        }).encode().toBuffer(),
        'should encode sequence number');

    bufferEqual(assert,
        new Buffer([0xFF, 0x01, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('text', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode text');

    bufferEqual(assert,
        new Buffer([0xFF, 0x02, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('copyright notice', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode copyright notice');

    bufferEqual(assert,
        new Buffer([0xFF, 0x03, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('sequence name', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode sequence name');

    bufferEqual(assert,
        new Buffer([0xFF, 0x04, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('instrument name', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode instrument name');

    bufferEqual(assert,
        new Buffer([0xFF, 0x05, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('lyrics', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode lyrics');

    bufferEqual(assert,
        new Buffer([0xFF, 0x06, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('marker', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode marker');

    bufferEqual(assert,
        new Buffer([0xFF, 0x07, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('cue point', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode cue point');

    bufferEqual(assert,
        new Buffer([0xFF, 0x08, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('program name', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode program name');

    bufferEqual(assert,
        new Buffer([0xFF, 0x09, 4, 0x4d, 0x49, 0x44, 0x49]),
        new MetaEvent('device name', {
            text: 'MIDI'
        }).encode().toBuffer(),
        'should encode device name');

    bufferEqual(assert,
        new Buffer([0xFF, 0x2F, 0]),
        new MetaEvent('end of track').encode().toBuffer(),
        'should encode end of track');

    bufferEqual(assert,
        new Buffer([0xFF, 0x51, 3, 0x07, 0xA1, 0x20]),
        new MetaEvent('set tempo', {
            tempo: 120
        }).encode().toBuffer(),
        'should encode tempo');

    bufferEqual(assert,
        new Buffer([0xFF, 0x54, 5, 12, 20, 30, 21, 56]),
        new MetaEvent('smpte offset', {
            rate: 24,
            hours: 12,
            minutes: 20,
            seconds: 30,
            frames: 21,
            subframes: 56
        }).encode().toBuffer(),
        'should encode smpte offset');

    bufferEqual(assert,
        new Buffer([0xFF, 0x58, 4, 2, 3, 21, 8]),
        new MetaEvent('time signature', {
            numerator: 2,
            denominator: 8,
            metronome: 21
        }).encode().toBuffer(),
        'should encode time signature');

    bufferEqual(assert,
        new Buffer([0xFF, 0x59, 2, 0xfc, 0x00]),
        new MetaEvent('key signature', {
            note: -4,
            major: true
        }).encode().toBuffer(),
        'should encode key signature');

    bufferEqual(assert,
        new Buffer([0xFF, 0x74, 2, 13, 37]),
        new MetaEvent(0x74, {
            bytes: new Buffer([13, 37])
        }).encode().toBuffer(),
        'should encode other kinds');

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x00, 2, 0, 1
        ])).type,
        MetaEvent.TYPE.SEQUENCE_NUMBER,
        'should decode sequence number'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x00, 2, 0, 1
        ])).data,
        {
            number: 1
        },
        'should decode sequence number data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x01, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.TEXT,
        'should decode text'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x01, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode text data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x02, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.COPYRIGHT_NOTICE,
        'should decode copyright notice'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x02, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode copyright notice data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x03, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.SEQUENCE_NAME,
        'should decode sequence name'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x03, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode sequence name data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x04, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.INSTRUMENT_NAME,
        'should decode instrument name'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x04, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode instrument name data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x05, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.LYRICS,
        'should decode lyrics'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x05, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode lyrics data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x06, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.MARKER,
        'should decode marker'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x06, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode marker data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x07, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.CUE_POINT,
        'should decode cue point'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x07, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode cue point data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x08, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.PROGRAM_NAME,
        'should decode program name'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x08, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode program name data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x09, 4, 0x4d, 0x49, 0x44, 0x49
        ])).type,
        MetaEvent.TYPE.DEVICE_NAME,
        'should decode device name'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x09, 4, 0x4d, 0x49, 0x44, 0x49
        ])).data,
        {
            text: 'MIDI'
        },
        'should decode device name data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x2F, 0
        ])).type,
        MetaEvent.TYPE.END_OF_TRACK,
        'should decode end of track'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x51, 3, 0x07, 0xA1, 0x20
        ])).type,
        MetaEvent.TYPE.SET_TEMPO,
        'should decode tempo'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x51, 3, 0x07, 0xA1, 0x20
        ])).data,
        {
            tempo: 120
        },
        'should decode tempo data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x54, 5, 12, 20, 30, 21, 56
        ])).type,
        MetaEvent.TYPE.SMPTE_OFFSET,
        'should decode smpte offset'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x54, 5, 12, 20, 30, 21, 56
        ])).data,
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
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x58, 4, 2, 3, 21, 8
        ])).type,
        MetaEvent.TYPE.TIME_SIGNATURE,
        'should decode time signature'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x58, 4, 2, 3, 21, 8
        ])).data,
        {
            numerator: 2,
            denominator: 8,
            metronome: 21,
            notated32ndsPerMIDIBeat: 8
        },
        'should decode time signature data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x59, 2, 0xfc, 0x00
        ])).type,
        MetaEvent.TYPE.KEY_SIGNATURE,
        'should decode key signature'
    );

    assert.deepEqual(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x59, 2, 0xfc, 0x00
        ])).data,
        {
            note: -4,
            major: true
        },
        'should decode key signature data'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x74, 2, 13, 37
        ])).type,
        0x74,
        'should decode other kinds'
    );

    assert.equal(
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x74, 2, 13, 37
        ])).unknown, true,
        'should set unknown flag for other kinds'
    );

    bufferEqual(assert,
        MetaEvent.decode(0, 0xFF, new MIDIBuffer([
            0x74, 2, 13, 37
        ])).data.bytes,
        new Buffer([13, 37]),
        'should decode other kinds\' data');

    assert.end();
});

test('Encoding and decoding sysex events', function (assert) {
    bufferEqual(assert,
        new Buffer([0xF0, 3, 0xa, 0xb, 0xc]),
        new SysexEvent(
            'type 1', new Buffer([0xa, 0xb, 0xc])
        ).encode().toBuffer(),
        'should encode sysex events');

    assert.equal(
        SysexEvent.decode(0, 0xF7, new MIDIBuffer([
            3, 0x1, 0x2, 0x3
        ])).type,
        SysexEvent.TYPE.TYPE_2,
        'should decode sysex events'
    );

    bufferEqual(assert,
        SysexEvent.decode(0, 0xF7, new MIDIBuffer([
            3, 0x1, 0x2, 0x3
        ])).data,
        new Buffer([0x1, 0x2, 0x3]),
        'should decode sysex events data');

    assert.end();
});

test('Encoding and decoding channel events', function (assert) {
    bufferEqual(assert,
        new Buffer([0x80, 0, 120]),
        new ChannelEvent('note off', {
            note: 0,
            velocity: 120
        }).encode().toBuffer(),
        'should encode note off');

    bufferEqual(assert,
        new Buffer([0x80, 60, 127]),
        new ChannelEvent('note off', {
            note: 'C'
        }).encode().toBuffer(),
        'should encode note off with shortcuts');

    bufferEqual(assert,
        new Buffer([0x91, 0, 120]),
        new ChannelEvent('note on', {
            note: 0,
            velocity: 120
        }, 1).encode().toBuffer(),
        'should encode note on');

    bufferEqual(assert,
        new Buffer([0x91, 60, 127]),
        new ChannelEvent('note on', {
            note: 'C'
        }, 1).encode().toBuffer(),
        'should encode note on with shortcuts');

    bufferEqual(assert,
        new Buffer([0xA0, 0, 120]),
        new ChannelEvent('note aftertouch', {
            note: 0,
            pressure: 120
        }).encode().toBuffer(),
        'should encode note aftertouch');

    bufferEqual(assert,
        new Buffer([0xA0, 60, 127]),
        new ChannelEvent('note aftertouch', {
            note: 'C'
        }).encode().toBuffer(),
        'should encode note aftertouch with shortcuts');

    bufferEqual(assert,
        new Buffer([0xB0, 0, 63]),
        new ChannelEvent('controller', {
            type: 0,
            value: 63
        }).encode().toBuffer(),
        'should encode controller');

    bufferEqual(assert,
        new Buffer([0xB0, 64, 127]),
        new ChannelEvent('controller', {
            type: 'hold pedal'
        }).encode().toBuffer(),
        'should encode controller with shortcuts');

    bufferEqual(assert,
        new Buffer([0xC3, 2]),
        new ChannelEvent('program change', {
            instrument: 2
        }, 3).encode().toBuffer(),
        'should encode program change');

    bufferEqual(assert,
        new Buffer([0xC3, 19]),
        new ChannelEvent('program change', {
            instrument: 'church organ'
        }, 3).encode().toBuffer(),
        'should encode program change with shortcuts');

    bufferEqual(assert,
        new Buffer([0xD0, 24]),
        new ChannelEvent('channel aftertouch', {
            pressure: 24
        }).encode().toBuffer(),
        'should encode channel aftertouch');

    bufferEqual(assert,
        new Buffer([
            0xE0,
            parseInt('0111000', 2), parseInt('111110', 2)
            // => 1111100111000
            // => 7992
            // => -200 tones
        ]),
        new ChannelEvent('pitch bend', {
            value: -200
        }).encode().toBuffer(),
        'should encode pitch bend');

    assert.equal(
        ChannelEvent.decode(0, 0x85, new MIDIBuffer([0, 120])).channel, 5,
        'should decode channel number'
    );

    assert.equal(
        ChannelEvent.decode(0, 0x80, new MIDIBuffer([0, 120])).type,
        ChannelEvent.TYPE.NOTE_OFF,
        'should decode note off'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0x80, new MIDIBuffer([0, 120])).data,
        {
            note: 0,
            velocity: 120
        },
        'should decode note off data'
    );

    assert.equal(
        ChannelEvent.decode(0, 0x90, new MIDIBuffer([0, 127])).type,
        ChannelEvent.TYPE.NOTE_ON,
        'should decode note on'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0x90, new MIDIBuffer([0, 127])).data,
        {
            note: 0,
            velocity: 127
        },
        'should decode note on data'
    );

    assert.equal(
        ChannelEvent.decode(0, 0xA0, new MIDIBuffer([0, 120])).type,
        ChannelEvent.TYPE.NOTE_AFTERTOUCH,
        'should decode note aftertouch'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0xA0, new MIDIBuffer([0, 120])).data,
        {
            note: 0,
            pressure: 120
        },
        'should decode note aftertouch data'
    );

    assert.equal(
        ChannelEvent.decode(0, 0xB0, new MIDIBuffer([0, 63])).type,
        ChannelEvent.TYPE.CONTROLLER,
        'should decode controller'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0xB0, new MIDIBuffer([0, 63])).data,
        {
            type: 0,
            value: 63
        },
        'should decode controller data'
    );

    assert.equal(
        ChannelEvent.decode(0, 0xC0, new MIDIBuffer([2])).type,
        ChannelEvent.TYPE.PROGRAM_CHANGE,
        'should decode program change'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0xC0, new MIDIBuffer([2])).data,
        {
            instrument: 2
        },
        'should decode program change data'
    );

    assert.equal(
        ChannelEvent.decode(0, 0xD0, new MIDIBuffer([24])).type,
        ChannelEvent.TYPE.CHANNEL_AFTERTOUCH,
        'should decode channel aftertouch'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0xD0, new MIDIBuffer([24])).data,
        {
            pressure: 24
        },
        'should decode channel aftertouch data'
    );

    assert.equal(
        ChannelEvent.decode(0, 0xE0, new MIDIBuffer([56, 62])).type,
        ChannelEvent.TYPE.PITCH_BEND,
        'should decode pitch bend'
    );

    assert.deepEqual(
        ChannelEvent.decode(0, 0xE0, new MIDIBuffer([
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
