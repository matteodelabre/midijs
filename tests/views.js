'use strict';

/**
 * Test suite for SeekerView and MIDIView utils
 */

const test = require('tape');
const encoding = require('text-encoding');

const SeekerView = require('../lib/util/seekerview');
const MIDIView = require('../lib/util/midiview');

const textEncoder = encoding.TextEncoder('utf-8');
const textDecoder = encoding.TextDecoder('utf-8');

test('Getting and setting buffered data with SeekerView', assert => {
    const view = SeekerView({buffer: new ArrayBuffer(8)});

    assert.equal(view.tell(), 0, 'initial cursor position should be 0');
    view.seek(1);
    assert.equal(view.tell(), 1, 'should move cursor with #seek()');
    view.seek(0);

    // 8-bits integers
    view.setInt8(120);
    assert.equal(view.tell(), 1, 'setting 8-bits integer should move the cursor');
    view.seek(0);
    assert.equal(view.getInt8(), 120, 'should retrieve set 8-bits integer');
    assert.equal(view.tell(), 1, 'getting 8-bits integer should move the cursor');
    view.seek(0);

    view.setUint8(250);
    assert.equal(view.tell(), 1, 'setting unsigned 8-bits integer should move the cursor');
    view.seek(0);
    assert.equal(view.getUint8(), 250, 'should retrieve set unsigned 8-bits integer');
    assert.equal(view.tell(), 1, 'getting unsigned 8-bits integer should move the cursor');
    view.seek(0);

    // 16-bits integers
    view.setInt16(-32700);
    assert.equal(view.tell(), 2, 'setting 16-bits integer should move the cursor');
    view.seek(0);
    assert.equal(view.getInt16(), -32700, 'should retrieve set 16-bits integer');
    assert.equal(view.tell(), 2, 'getting 16-bits integer should move the cursor');
    view.seek(0);

    view.setUint16(65200);
    assert.equal(view.tell(), 2, 'setting unsigned 16-bits integer should move the cursor');
    view.seek(0);
    assert.equal(view.getUint16(), 65200, 'should retrieve set unsigned 16-bits integer');
    assert.equal(view.tell(), 2, 'getting unsigned 16-bits integer should move the cursor');
    view.seek(0);

    // 32-bits integers
    view.setInt32(-203730);
    assert.equal(view.tell(), 4, 'setting 32-bits integer should move the cursor');
    view.seek(0);
    assert.equal(view.getInt32(), -203730, 'should retrieve set 32-bits integer');
    assert.equal(view.tell(), 4, 'getting 32-bits integer should move the cursor');
    view.seek(0);

    view.setUint32(214748040);
    assert.equal(view.tell(), 4, 'setting unsigned 32-bits integer should move the cursor');
    view.seek(0);
    assert.equal(view.getUint32(), 214748040, 'should retrieve set unsigned 32-bits integer');
    assert.equal(view.tell(), 4, 'getting unsigned 32-bits integer should move the cursor');
    view.seek(0);

    // single-precision floats
    view.setFloat32(3.14159);
    assert.equal(view.tell(), 4, 'setting 32-bits float should move the cursor');
    view.seek(0);
    assert.equal(+view.getFloat32().toPrecision(6), 3.14159, 'should retrieve set 32-bits float');
    assert.equal(view.tell(), 4, 'getting 32-bits float should move the cursor');
    view.seek(0);

    // double-precision floats
    view.setFloat64(3.14159265358979);
    assert.equal(view.tell(), 8, 'setting 64-bits float should move the cursor');
    view.seek(0);
    assert.equal(+view.getFloat64().toPrecision(15), 3.14159265358979, 'should retrieve set 64-bits float');
    assert.equal(view.tell(), 8, 'getting 64-bits float should move the cursor');
    view.seek(0);

    assert.end();
});

test('Getting and setting data arrays with SeekerView', assert => {
    const view = SeekerView({buffer: new ArrayBuffer(14)});

    view.setInt16(1000);
    view.setInt16(2000);
    view.setInt16(3000);
    view.setInt16(4000);
    view.seek(0);

    const arr = view.getInt16Array(4);
    assert.equal(view.tell(), 8, 'getting an array should move the cursor');
    assert.equal(arr[0], 1000, 'should retrieve arrays correctly #1');
    assert.equal(arr[1], 2000, 'should retrieve arrays correctly #2');
    assert.equal(arr[2], 3000, 'should retrieve arrays correctly #3');
    assert.equal(arr[3], 4000, 'should retrieve arrays correctly #4');
    view.seek(0);

    view.setUint8Array(textEncoder.encode('this is a test'));
    assert.equal(view.tell(), 14, 'setting an array should move the cursor');
    view.seek(0);
    assert.equal(textDecoder.decode(view.getUint8Array(14)), 'this is a test',
        'should retrieve wrote arrays correctly');
    view.seek(0);

    assert.end();
});

test('Getting and setting variable integers with MIDIView', assert => {
    const view = MIDIView({buffer: new ArrayBuffer(4)});

    assert.equal(MIDIView.getVarIntLength(0x08000000), 4, 'should predict varint length');
    assert.equal(MIDIView.getVarIntLength(0x1FFFFFFF), false, 'should return false with oversized integer');

    view.setVarInt(0x08000000);
    assert.equal(view.tell(), 4, 'should move cursor when setting variable integer');
    view.seek(0);

    assert.equal(view.getUint8(), 0xC0, 'should write var ints correctly #1');
    assert.equal(view.getUint8(), 0x80, 'should write var ints correctly #2');
    assert.equal(view.getUint8(), 0x80, 'should write var ints correctly #3');
    assert.equal(view.getUint8(), 0x00, 'should write var ints correctly #4');
    view.seek(0);

    assert.equal(view.getVarInt(), 0x08000000, 'should retrieve set variable integer');
    assert.end();
});
