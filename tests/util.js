'use strict';

/**
 * @overview Test set for all lib utilities
 */

var test = require('tape');

var buffer = require('../lib/util/buffer');
var convertNote = require('../lib/util/convert-note');
var selectConst = require('../lib/util/select-const');

test('buffer', function (sub) {
    sub.test('should initialize buffer and dispose of properly', function (assert) {
        var buf = new Buffer(1);

        assert.equal(buffer.tell(buf), undefined, 'should not have cursor in the first place');
        buffer.start(buf);
        assert.equal(buffer.tell(buf), 0, 'should initialize to 0');
        buffer.seek(buf, 1);
        assert.equal(buffer.tell(buf), 1, 'should tell properly');
        assert.ok(buffer.eof(buf), 'should tell if we are at the end of the buffer');
        buffer.start(buf);
        assert.equal(buffer.tell(buf), 1, 'should keep cursor across stacks');
        buffer.end(buf);
        assert.equal(buffer.tell(buf), 1, 'should keep cursor after stacking');
        buffer.end(buf);
        assert.equal(buffer.tell(buf), undefined, 'should erase cursor after removal');

        assert.end();
    });

    sub.test('should perform operations on the buffer', function (assert) {
        var buf = new Buffer(28), buf2 = new Buffer(7), actions = [
            ['UIntBE', 'unsigned integers (big endian)', [200, 60000, 4000000000]],
            ['UIntLE', 'unsigned integers (little endian)', [200, 60000, 4000000000]],
            ['IntBE', 'signed integers (big endian)', [100, 30000, 2000000000]],
            ['IntLE', 'signed integers (little endian)', [100, 30000, 2000000000]]
        ], bytes = [1, 2, 4], slice;

        buffer.start(buf);
        buffer.start(buf2);

        actions.forEach(function (series) {
            series[2].forEach(function (number, i) {
                buffer['write' + series[0]](buf, bytes[i], number);
                buffer.seek(buf, buffer.tell(buf) - bytes[i]);
                assert.equal(buffer['read' + series[0]](buf, bytes[i]), number, 'should write and read ' + series[1]);
            });
        });

        buffer.seek(buf, 0);
        buffer.write(buf, 'testing strings usability !!', 'ascii');
        buffer.seek(buf, 0);
        assert.equal(buffer.toString(buf, 'ascii'), 'testing strings usability !!', 'should write and read strings');

        buffer.copy(buf2, buf, 0, 7);
        assert.equal(buf2.toString('ascii'), 'testing', 'should copy buffers');

        buffer.seek(buf2, 0);
        slice = buffer.slice(buf2, 4);
        slice.write('work');
        assert.equal(buf2.toString('ascii'), 'working', 'should slice buffers');

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
