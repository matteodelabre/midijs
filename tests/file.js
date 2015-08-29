'use strict';

/**
 * @overview Test set for File, Track and Chunk
 */

var test = require('tape');
var bufferEqual = require('./util/buffer-equal');

var fs = require('fs');
var path = require('path');

var File = require('../').File;
var events = require('../').events;

var songpath = path.join(__dirname, 'fixtures/tune.mid');

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

    sub.test('should allow constant shortcuts', function (assert) {
        var file = new File();

        file.type = 'async tracks';
        assert.equal(file.type, File.TYPE.ASYNC_TRACKS, 'should convert strings to constants');

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

    sub.test('should detect erroneous files', function (assert) {
        assert.throws(function () {
            File.decode(new Buffer('not midi data'));
        }, /not a midi file/i, 'should throw with non-midi files');

        assert.throws(function () {
            File.decode(new Buffer([
                // regular MIDI header
                0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
                0x00, 0x01, 0x00, 0x03, 0x00, 0x78,
                // invalid duplicate empty header
                0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x00
            ]));
        }, /expected a track chunk/i, 'should throw with chunk-malformed files');

        assert.end();
    });

    sub.test('should enable file creation', function (assert) {
        var file = new File();

        assert.equal(
            file.track()
                .channel('program change', {
                    instrument: 'acoustic grand piano'
                })
                .meta('text', {
                    text: 'testing'
                })
                .sysex('type 1', new Buffer('void'))
                .note('E4', 120, 1, 5, 103)
                .note(['E4', 'E5'], 120, 1, 5, 103)
            .end(),
            file,
            'should allow chaining'
        );

        assert.equal(file.tracks.length, 1, 'should create a track');
        assert.equal(file.tracks[0].events.length, 10, 'should create events');
        assert.ok(file.tracks[0].events[0] instanceof events.ChannelEvent, 'should create channel events');
        assert.ok(file.tracks[0].events[1] instanceof events.MetaEvent, 'should create meta events');
        assert.ok(file.tracks[0].events[2] instanceof events.SysexEvent, 'should create sysex events');

        assert.ok(file.tracks[0].events[3] instanceof events.ChannelEvent, 'shortcut notation should yield ChannelEvents');
        assert.ok(file.tracks[0].events[4] instanceof events.ChannelEvent, 'shortcut notation should yield ChannelEvents');
        assert.ok(file.tracks[0].events[5] instanceof events.ChannelEvent, 'shortcut notation should yield ChannelEvents');
        assert.ok(file.tracks[0].events[6] instanceof events.ChannelEvent, 'shortcut notation should yield ChannelEvents');
        assert.ok(file.tracks[0].events[7] instanceof events.ChannelEvent, 'shortcut notation should yield ChannelEvents');
        assert.ok(file.tracks[0].events[8] instanceof events.ChannelEvent, 'shortcut notation should yield ChannelEvents');

        assert.equal(file.tracks[0].events[3].type, events.ChannelEvent.TYPE.NOTE_ON, 'shortcut notation should yield NOTE_ONs');
        assert.equal(file.tracks[0].events[4].type, events.ChannelEvent.TYPE.NOTE_ON, 'shortcut notation should yield NOTE_ONs');
        assert.equal(file.tracks[0].events[5].type, events.ChannelEvent.TYPE.NOTE_ON, 'shortcut notation should yield NOTE_ONs');
        assert.equal(file.tracks[0].events[6].type, events.ChannelEvent.TYPE.NOTE_ON, 'shortcut notation should yield NOTE_ONs');
        assert.equal(file.tracks[0].events[7].type, events.ChannelEvent.TYPE.NOTE_ON, 'shortcut notation should yield NOTE_ONs');
        assert.equal(file.tracks[0].events[8].type, events.ChannelEvent.TYPE.NOTE_ON, 'shortcut notation should yield NOTE_ONs');

        assert.equal(file.tracks[0].events[3].delay, 5, 'shortcut notation should delay sequenced events properly');
        assert.equal(file.tracks[0].events[4].delay, 120, 'shortcut notation should delay sequenced events properly');
        assert.equal(file.tracks[0].events[5].delay, 5, 'shortcut notation should delay sequenced events properly');
        assert.equal(file.tracks[0].events[6].delay, 0, 'shortcut notation should delay sequenced events properly');
        assert.equal(file.tracks[0].events[7].delay, 120, 'shortcut notation should delay sequenced events properly');
        assert.equal(file.tracks[0].events[8].delay, 0, 'shortcut notation should delay sequenced events properly');

        assert.equal(file.tracks[0].events[3].channel, 1, 'shortcut notation should associate correct channels');
        assert.equal(file.tracks[0].events[4].channel, 1, 'shortcut notation should associate correct channels');
        assert.equal(file.tracks[0].events[5].channel, 1, 'shortcut notation should associate correct channels');
        assert.equal(file.tracks[0].events[6].channel, 1, 'shortcut notation should associate correct channels');
        assert.equal(file.tracks[0].events[7].channel, 1, 'shortcut notation should associate correct channels');
        assert.equal(file.tracks[0].events[8].channel, 1, 'shortcut notation should associate correct channels');

        assert.equal(file.tracks[0].events[3].data.velocity, 103, 'shortcut notation should work with chords');
        assert.equal(file.tracks[0].events[4].data.velocity, 0, 'shortcut notation should work with chords');
        assert.equal(file.tracks[0].events[5].data.velocity, 103, 'shortcut notation should work with chords');
        assert.equal(file.tracks[0].events[6].data.velocity, 103, 'shortcut notation should work with chords');
        assert.equal(file.tracks[0].events[7].data.velocity, 0, 'shortcut notation should work with chords');
        assert.equal(file.tracks[0].events[8].data.velocity, 0, 'shortcut notation should work with chords');

        assert.equal(file.tracks[0].events[9].type, events.MetaEvent.TYPE.END_OF_TRACK, 'should append end event');

        assert.end();
    });
});
