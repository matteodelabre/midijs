'use strict';

/**
 * @overview Test set for all lib utilities
 */

var test = require('tape');
var bufferEqual = require('./util/buffer-equal');

var MIDIBuffer = require('../lib/util/buffer');
var convertNote = require('../lib/util/convert-note');
var selectConst = require('../lib/util/select-const');

test('Creating and converting MIDI buffers', function (assert) {
    var buf, subuf;

    assert.equal(new MIDIBuffer(4).getLength(), 4,
        'should create from numbers');
    assert.equal(new MIDIBuffer([1, 2, 3]).getLength(), 3,
        'should create from arrays');
    assert.equal(new MIDIBuffer(new Buffer([1, 5])).getLength(), 2,
        'should create from buffers');
    assert.equal(new MIDIBuffer(new MIDIBuffer(12)).getLength(), 12,
        'should create from MIDI buffers');

    buf = new MIDIBuffer(5);
    buf.write('abcde');
    buf.seek(0);

    subuf = new MIDIBuffer(buf);
    assert.equal(subuf.parent, buf, 'should keep track of its parent');

    subuf.seek(1);
    assert.equal(buf.tell(), 1, 'should move parent\'s cursor');
    assert.end();
});

test('Concat MIDI buffers', function (assert) {
    bufferEqual(assert,
        Buffer.concat([new Buffer([1, 2]), new Buffer([3, 4])]),
        MIDIBuffer.concat([new Buffer([1, 2]), new Buffer([3, 4])]).toBuffer(),
        'should work with buffers');

    bufferEqual(assert,
        new Buffer([1, 2, 3, 4]),
        MIDIBuffer.concat([
            new MIDIBuffer([1, 2]), new MIDIBuffer([3, 4])
        ]).toBuffer(),
        'should work with midi buffers');

    bufferEqual(assert,
        new Buffer([1, 2, 3, 4]),
        MIDIBuffer.concat([[1, 2], [3, 4]]).toBuffer(),
        'should work with arrays');

    assert.end();
});

test('Reading cursor in MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(10);

    assert.equal(buf.tell(), 0, 'initial position = 0');

    buf.seek(5);
    assert.equal(buf.tell(), 5, 'should move cursor');

    assert.throws(function () {
        buf.seek(11);
    }, /beyond limits/, 'should not seek beyond limits');

    buf.seek(10);
    assert.ok(buf.eof(), 'should detect eof');

    assert.equal(buf.getLength(), 10, 'should report length');
    assert.end();
});

test('Converting MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(10), norm = new Buffer(10), arr;

    buf.write('abcdefghij');
    norm.write('abcdefghij');
    arr = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106];

    bufferEqual(assert, buf.toBuffer(), norm,
        'should convert to buffer');

    assert.deepEqual(
        buf.toArray(), arr,
        'should convert to array'
    );

    assert.equal(
        buf.toUint8Array()[0], arr[0],
        'should convert to uint8array'
    );

    assert.ok(
        buf.toUint8Array() instanceof Uint8Array,
        'should convert to uint8array'
    );

    assert.end();
});

test('Reading and writing integers in MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(28);

    buf.writeUIntBE(8, 200);
    assert.equal(buf.toBuffer()[0], 0xc8,
        'should write 8-bits unsigned integers');

    buf.writeUIntLE(8, 200);
    assert.equal(buf.toBuffer()[1], 0xc8,
        'should write 8-bits unsigned integers');

    buf.writeUIntBE(16, 60000);
    assert.equal(buf.toBuffer()[2], 0xea,
        'should write 16-bits unsigned integers (big endian)');
    assert.equal(buf.toBuffer()[3], 0x60,
        'should write 16-bits unsigned integers (big endian)');

    buf.writeUIntLE(16, 60000);
    assert.equal(buf.toBuffer()[4], 0x60,
        'should write 16-bits unsigned integers (little endian)');
    assert.equal(buf.toBuffer()[5], 0xea,
        'should write 16-bits unsigned integers (little endian)');

    buf.writeUIntBE(32, 4000000000);
    assert.equal(buf.toBuffer()[6], 0xee,
        'should write 32-bits unsigned integers (big endian)');
    assert.equal(buf.toBuffer()[7], 0x6b,
        'should write 32-bits unsigned integers (big endian)');
    assert.equal(buf.toBuffer()[8], 0x28,
        'should write 32-bits unsigned integers (big endian)');
    assert.equal(buf.toBuffer()[9], 0x00,
        'should write 32-bits unsigned integers (big endian)');

    buf.writeUIntLE(32, 4000000000);
    assert.equal(buf.toBuffer()[10], 0x00,
        'should write 32-bits unsigned integers (little endian)');
    assert.equal(buf.toBuffer()[11], 0x28,
        'should write 32-bits unsigned integers (little endian)');
    assert.equal(buf.toBuffer()[12], 0x6b,
        'should write 32-bits unsigned integers (little endian)');
    assert.equal(buf.toBuffer()[13], 0xee,
        'should write 32-bits unsigned integers (little endian)');

    buf.writeIntBE(8, -100);
    assert.equal(buf.toBuffer()[14], 0x9c,
        'should write 8-bits signed integers');

    buf.writeIntLE(8, -100);
    assert.equal(buf.toBuffer()[15], 0x9c,
        'should write 8-bits signed integers');

    buf.writeIntBE(16, -30000);
    assert.equal(buf.toBuffer()[16], 0x8a,
        'should write 16-bits signed integers (big endian)');
    assert.equal(buf.toBuffer()[17], 0xd0,
        'should write 16-bits signed integers (big endian)');

    buf.writeIntLE(16, -30000);
    assert.equal(buf.toBuffer()[18], 0xd0,
        'should write 16-bits signed integers (little endian)');
    assert.equal(buf.toBuffer()[19], 0x8a,
        'should write 16-bits signed integers (little endian)');

    buf.writeIntBE(32, -2000000000);
    assert.equal(buf.toBuffer()[20], 0x88,
        'should write 32-bits signed integers (big endian)');
    assert.equal(buf.toBuffer()[21], 0xca,
        'should write 32-bits signed integers (big endian)');
    assert.equal(buf.toBuffer()[22], 0x6c,
        'should write 32-bits signed integers (big endian)');
    assert.equal(buf.toBuffer()[23], 0x00,
        'should write 32-bits signed integers (big endian)');

    buf.writeIntLE(32, -2000000000);
    assert.equal(buf.toBuffer()[24], 0x00,
        'should write 32-bits signed integers (little endian)');
    assert.equal(buf.toBuffer()[25], 0x6c,
        'should write 32-bits signed integers (little endian)');
    assert.equal(buf.toBuffer()[26], 0xca,
        'should write 32-bits signed integers (little endian)');
    assert.equal(buf.toBuffer()[27], 0x88,
        'should write 32-bits signed integers (little endian)');

    buf.seek(0);

    assert.equal(buf.readUIntBE(8), 200,
        'should read 8-bits unsigned integers');

    assert.equal(buf.readUIntLE(8), 200,
        'should read 8-bits unsigned integers');

    assert.equal(buf.readUIntBE(16), 60000,
        'should read 16-bits unsigned integers (big endian)');

    assert.equal(buf.readUIntLE(16), 60000,
        'should read 16-bits unsigned integers (little endian)');

    assert.equal(buf.readUIntBE(32), 4000000000,
        'should read 32-bits unsigned integers (big endian)');

    assert.equal(buf.readUIntLE(32), 4000000000,
        'should read 32-bits unsigned integers (little endian)');

    assert.equal(buf.readIntBE(8), -100,
        'should read 8-bits signed integers');

    assert.equal(buf.readIntLE(8), -100,
        'should read 8-bits signed integers');

    assert.equal(buf.readIntBE(16), -30000,
        'should read 16-bits signed integers (big endian)');

    assert.equal(buf.readIntLE(16), -30000,
        'should read 16-bits signed integers (little endian)');

    assert.equal(buf.readIntBE(32), -2000000000,
        'should read 32-bits signed integers (big endian)');

    assert.equal(buf.readIntLE(32), -2000000000,
        'should read 32-bits signed integers (little endian)');

    assert.end();
});

test('Reading and writing var-integers in MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(100);

    buf.writeVarInt(MIDIBuffer.MAX_VAR_INT);
    buf.seek(0);

    bufferEqual(assert,
        buf.toBuffer().slice(0, 4),
        [0xFF, 0xFF, 0xFF, 0x7F],
        'should encode correct sequence');

    assert.equal(buf.readVarInt(), MIDIBuffer.MAX_VAR_INT,
        'should write & read variable integers');

    assert.throws(function () {
        buf.seek(0);
        buf.writeVarInt(MIDIBuffer.MAX_VAR_INT + 1);
    }, /too large/, 'should throw with too large numbers');

    buf = new MIDIBuffer([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    assert.equal(buf.readVarInt(), MIDIBuffer.MAX_VAR_INT,
        'should truncate malformed variable integers');

    assert.equal(MIDIBuffer.getVarIntLength(MIDIBuffer.MAX_VAR_INT), 4,
        'should predict variable integer\'s length in bytes');

    assert.equal(MIDIBuffer.getVarIntLength(MIDIBuffer.MAX_VAR_INT + 1), false,
        'getVarIntLength should return false with too large numbers');

    assert.end();
});

test('Reading and writing chunks in MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(12), data = new Buffer([1, 2, 3, 4]), result;

    buf.writeChunk('test', data);
    bufferEqual(assert, MIDIBuffer.concat([
        new Buffer('test'),
        new Buffer([0, 0, 0, 4, 1, 2, 3, 4])
    ]).toBuffer(), buf.toBuffer(), 'should write chunks');

    buf.seek(0);
    result = buf.readChunk();

    assert.equal(result.type, 'test');
    bufferEqual(assert, result.data.toBuffer(), data, 'should read chunks');

    assert.end();
});

test('Reading and writing strings in MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(4);

    buf.write('abcd');
    assert.equal(buf.toBuffer()[0], 97, 'should have written the "a"');
    assert.equal(buf.toBuffer()[1], 98, 'should have written the "b"');
    assert.equal(buf.toBuffer()[2], 99, 'should have written the "c"');
    assert.equal(buf.toBuffer()[3], 100, 'should have written the "d"');

    buf.seek(0);
    assert.equal(buf.toString(), 'abcd', 'should read strings');
    assert.end();
});

test('Copying and slicing MIDI buffers', function (assert) {
    var buf = new MIDIBuffer(4), copy = new MIDIBuffer(4);

    buf.write('lkj.');
    copy.write('.ljg');

    copy.seek(0);
    copy.copy(buf, 0, 2);

    copy.seek(0);
    assert.equal(copy.toString(), 'lkjg', 'should copy buffers');

    copy.seek(2);
    bufferEqual(assert, copy.slice(2).toBuffer(), new Buffer('jg'),
        'should slice buffers');

    assert.end();
});

test('Conversion of English notated MIDI notes', function (assert) {
    assert.equal(convertNote('C4'), convertNote('C'), 'should default octave to 4');
    assert.equal(convertNote('C4#'), convertNote('C4') + 1, 'should parse sharps');
    assert.equal(convertNote('C4B'), convertNote('C4') - 1, 'should parse flats');
    assert.equal(convertNote('C4♯'), convertNote('C4#'), 'should allow alternative notation');
    assert.equal(convertNote('C4B'), convertNote('C4♭'), 'should allow alternative notation');
    assert.equal(convertNote('C-1'), 0, 'should start at 0');
    assert.equal(convertNote('C4'), 60, 'should have middle at 64');
    assert.equal(convertNote('C8'), 108, 'should end at 108');
    assert.end();
});

test('Selection of constants by their names', function (assert) {
    assert.equal(selectConst({
        TEST_SELECT_CONSTS: 2
    }, 'Test  SELECT ! consts'), 2, 'should convert case correctly');
    assert.end();
});
