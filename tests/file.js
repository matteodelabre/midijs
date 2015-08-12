'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');
var File = require('../').File;

var songpath = path.join(__dirname, 'fixtures/song.mid');

/**
 * Check whether to buffers contain the same data or not
 *
 * @param {Buffer} a First buffer
 * @param {Buffer} b Second buffer
 * @return {bool} Whether the two buffers equal or not
 */
function bufferEqual(a, b) {
    var length = a.length, i;

    if (length !== b.length) {
        return false;
    }

    for (i = 0; i < length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

test('File', function (sub) {
    sub.test('should create an empty file', function (assert) {
        var file = new File();

        assert.equal(file.type, File.TYPE.SYNC_TRACKS, 'should be sync by default');
        assert.equal(file.tracks.length, 0, 'should have no tracks');
        assert.equal(file.ticksPerBeat, 120, 'should be 120 tpb');

        assert.end();
    });

    sub.test('should ensure values are valid', function (assert) {
        var file = new File();

        file.type = 'this is not valid';
        assert.equal(file.type, File.TYPE.SYNC_TRACKS, 'should not allow strings');
        file.type = -1;
        assert.equal(file.type, File.TYPE.SYNC_TRACKS, 'should not allow out of bounds values');

        file.ticksPerBeat = 'this is not valid';
        assert.equal(file.ticksPerBeat, 120, 'should not allow strings');
        file.ticksPerBeat = -1;
        assert.equal(file.ticksPerBeat, 120, 'should not allow out of bounds values');

        assert.end();
    });

    sub.test('should decode a file and encode it back to the exact same bytes', function (assert) {
        fs.readFile(songpath, function (err, buffer) {
            var file;

            assert.error(err, 'should read file successfully');
            file = File.decode(buffer);

            assert.ok(bufferEqual(buffer, file.encode()), 'should result in the same data');
            assert.end();
        });
    });
});
