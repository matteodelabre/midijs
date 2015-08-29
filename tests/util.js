'use strict';

/**
 * @overview Test set for all lib utilities
 */

var test = require('tape');
var bufferEqual = require('./util/buffer-equal');

var MIDIBuffer = require('../lib/util/buffer');
var convertNote = require('../lib/util/convert-note');
var selectConst = require('../lib/util/select-const');

test('buffer', function (sub) {
    sub.test('should create and convert buffers', function (assert) {
        var buf, subuf;

        assert.equal(new MIDIBuffer(4).getLength(), 4, 'should create from numbers');
        assert.equal(new MIDIBuffer([1, 2, 3]).getLength(), 3, 'should create from arrays');
        assert.equal(new MIDIBuffer(new Buffer([1, 5])).getLength(), 2, 'should create from buffers');
        assert.equal(new MIDIBuffer(new MIDIBuffer(12)).getLength(), 12, 'should create from midi buffers');

        buf = new MIDIBuffer(5);
        buf.write('abcde');
        buf.seek(0);

        subuf = new MIDIBuffer(buf);
        assert.equal(subuf.parent, buf, 'should keep track of parent');

        subuf.seek(1);
        assert.equal(buf.tell(), 1, 'should move parent\'s cursor');
        assert.end();
    });

    sub.test('should concat midi buffers', function (assert) {
        assert.ok(bufferEqual(
            Buffer.concat([new Buffer([1, 2]), new Buffer([3, 4])]),
            MIDIBuffer.concat([new Buffer([1, 2]), new Buffer([3, 4])])
        ), 'should work with buffers');

        assert.ok(bufferEqual(
            new Buffer([1, 2, 3, 4]),
            MIDIBuffer.concat([new MIDIBuffer([1, 2]), new MIDIBuffer([3, 4])])
        ), 'should work with midi buffers');

        assert.ok(bufferEqual(
            new Buffer([1, 2, 3, 4]),
            MIDIBuffer.concat([[1, 2], [3, 4]])
        ), 'should work with arrays');

        assert.end();
    });

    sub.test('should have a cursor', function (assert) {
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

    sub.test('should convert midi buffers', function (assert) {
        var buf = new MIDIBuffer(10), norm = new Buffer(10), arr;

        buf.write('abcdefghij');
        norm.write('abcdefghij');
        arr = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106];

        assert.ok(
            bufferEqual(buf.toBuffer(), norm),
            'should convert to buffer'
        );

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

    sub.test('should read and write integers', function (assert) {
        var buf = new MIDIBuffer(28), actions = [
            ['UIntBE', 'unsigned integers (big endian)', [200, 60000, 4000000000]],
            ['UIntLE', 'unsigned integers (little endian)', [200, 60000, 4000000000]],
            ['IntBE', 'signed integers (big endian)', [100, 30000, 2000000000]],
            ['IntLE', 'signed integers (little endian)', [100, 30000, 2000000000]]
        ], bits = [8, 16, 32];

        actions.forEach(function (series) {
            series[2].forEach(function (number, i) {
                buf['write' + series[0]](bits[i], number);
                buf.seek(buf.tell() - bits[i] / 8);

                assert.equal(
                    buf['read' + series[0]](bits[i]), number,
                    'should write and read ' + bits[i] + '-bits ' + series[1]
                );
            });
        });

        assert.end();
    });

    sub.test('should read and write variable integers', function (assert) {
        var buf = new MIDIBuffer(100);

        buf.writeVarInt(MIDIBuffer.MAX_VAR_INT);
        buf.seek(0);

        assert.ok(bufferEqual(buf.toBuffer().slice(0, 4), [0xFF, 0xFF, 0xFF, 0x7F]), 'should encode correct sequence');
        assert.equal(buf.readVarInt(), MIDIBuffer.MAX_VAR_INT, 'should write & read var ints');

        assert.throws(function () {
            buf.seek(0);
            buf.writeVarInt(MIDIBuffer.MAX_VAR_INT + 1);
        }, /too large/, 'should throw with too large numbers');

        buf = new MIDIBuffer([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
        assert.equal(buf.readVarInt(), MIDIBuffer.MAX_VAR_INT, 'should truncate malformed var ints');

        assert.equal(
            MIDIBuffer.getVarIntLength(MIDIBuffer.MAX_VAR_INT), 4,
            'should predict var int length in bytes'
        );

        assert.equal(
            MIDIBuffer.getVarIntLength(MIDIBuffer.MAX_VAR_INT + 1), false,
            'getVarIntLength should return false with too large numbers'
        );

        assert.end();
    });

    sub.test('should read and write chunks', function (assert) {
        var buf = new MIDIBuffer(12), data = new Buffer([1, 2, 3, 4]), result;

        buf.writeChunk('test', data);
        assert.ok(bufferEqual(
            MIDIBuffer.concat([new Buffer('test'), new Buffer([0, 0, 0, 4, 1, 2, 3, 4])]), buf
        ), 'should write chunks');

        buf.seek(0);
        result = buf.readChunk();

        assert.equal(result.type, 'test');
        assert.ok(bufferEqual(result.data, data), 'should read chunks');

        assert.end();
    });

    sub.test('should read and write strings', function (assert) {
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

    sub.test('should copy and slice buffers', function (assert) {
        var buf = new MIDIBuffer(4), copy = new MIDIBuffer(4);

        buf.write('lkj.');
        copy.write('.ljg');

        copy.seek(0);
        copy.copy(buf, 0, 2);

        copy.seek(0);
        assert.equal(copy.toString(), 'lkjg', 'should copy buffers');

        copy.seek(2);
        assert.ok(bufferEqual(copy.slice(2), new Buffer('jg')));
        assert.end();
    });
});

test('convertNote', function (assert) {
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

test('selectConst', function (assert) {
    assert.equal(selectConst({
        TEST_SELECT_CONSTS: 2
    }, 'Test  SELECT ! consts'), 2, 'should convert case correctly');
    assert.end();
});
