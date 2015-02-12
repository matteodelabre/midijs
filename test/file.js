/*eslint-env mocha */

'use strict';

var assert = require('assert');
var path = require('path');
var util = require('util');
var fs = require('fs');

var File = require('../lib/file').File;
var MetaEvent = require('../lib/file/event').MetaEvent;
var SysexEvent = require('../lib/file/event').SysexEvent;
var ChannelEvent = require('../lib/file/event').ChannelEvent;

var filesPath = path.join(__dirname, 'files');
var pathFormat = path.join(filesPath, '%d_%d_time.mid');
var times = [
    [3, 4, true], [4, 4, true], [6, 8, true], [9, 8, true], [12, 8, true],
    [3, 4, false], [4, 4, false], [6, 8, false], [9, 8, false], [12, 8, false]
];

describe('File as a writer', function () {
    var file;
    
    it('should create a new file', function () {
        file = new File();
        
        assert.strictEqual(file.header.fileType, 1);
        assert.strictEqual(file.header.trackCount, 0);
        assert.strictEqual(file.header.ticksPerBeat, 120);
        
        assert.ok(Array.isArray(file.tracks));
        assert.strictEqual(file.tracks.length, file.header.trackCount);
    });
    
    describe('tracks edition', function () {
        it('should add a track', function () {
            var track = file.addTrack();
        });
    });
});

describe('File as a reader', function () {
    times.forEach(function (time) {
        var filePath = util.format(pathFormat, time[0], time[1]), file,
            streamMessage = (time[2]) ? 'read with streams' : 'read with buffers',
            message = util.format('file %s (%s)', path, streamMessage);
        
        describe(message, function () {
            before(function (done) {
                if (time[2]) {
                    file = new File();
                    file.on('parsed', done);
                    
                    fs.createReadStream(filePath).pipe(file);
                } else {
                    fs.readFile(filePath, function (err, data) {
                        if (err) {
                            throw err;
                        }

                        file = new File(data);
                        file.parse(done);
                    });
                }
            });

            it('should parse the header chunk', function () {
                assert.strictEqual(typeof file.header.fileType, 'number');
                assert.ok(file.header.fileType >= 0);
                assert.ok(file.header.fileType <= 2);

                assert.strictEqual(typeof file.header.trackCount, 'number');
                assert.ok(file.header.trackCount > 0, 'number');

                assert.strictEqual(typeof file.header.ticksPerBeat, 'number');
                assert.ok(file.header.ticksPerBeat > 0);
            });

            it('should parse the tracks chunks as a list of tracks', function () {
                assert.ok(Array.isArray(file.tracks));
                assert.strictEqual(file.tracks.length, file.header.trackCount);
            });

            it('should parse each track chunk', function () {
                var channelTypes, metaTypes;
                
                channelTypes = ['noteOff', 'noteOn', 'noteAftertouch',
                                'controller', 'programChange',
                                'channelAftertouch', 'pitchBend'];
                metaTypes = ['sequenceNumber', 'text', 'copyrightNotice',
                            'sequenceName', 'instumentName', 'lyrics',
                            'marker', 'cuePoint', 'channelPrefix',
                            'endOfTrack', 'setTempo', 'timeSignature',
                            'keySignature', 'sequencerSpecific'];

                file.tracks.forEach(function (track) {
                    assert.ok(Array.isArray(track.events));

                    track.events.forEach(function (event, index) {
                        assert.strictEqual(typeof event.delay, 'number');

                        if (index === track.events.length - 1) {
                            assert.ok(event instanceof MetaEvent);
                            assert.strictEqual(event.type, 'endOfTrack');
                            return;
                        }
                        
                        if (event instanceof MetaEvent) {
                            assert.notStrictEqual(
                                metaTypes.indexOf(event.type),
                                -1
                            );

                            switch (event.type) {
                            case 'timeSignature':
                                assert.strictEqual(event.numerator, time[0]);
                                assert.strictEqual(event.denominator, time[1]);
                                assert.strictEqual(typeof event.metronome, 'number');
                                assert.strictEqual(event.clockSignalsPerBeat, 24);
                                break;

                            case 'keySignature':
                                assert.ok(event.major);
                                assert.strictEqual(event.note, 0);
                                break;

                            case 'setTempo':
                                assert.strictEqual(event.tempo, 600000);
                                break;
                            }
                        } else if (event instanceof SysexEvent) {
                            
                        } else if (event instanceof ChannelEvent) {
                            assert.strictEqual(typeof event.channel, 'number');
                            assert.ok(event.channel >= 0);
                            assert.ok(event.channel <= 15);

                            assert.notStrictEqual(
                                channelTypes.indexOf(event.type),
                                -1
                            );
                        } else {
                            throw new Error('Expected event of type Meta, Sysex or Channel');
                        }
                    });
                });
            });
        });
    });
    
    describe('invalid file "' + filesPath + 'invalid_file.mid"', function () {
        var filePath = path.join(filesPath, 'invalid_file.mid'), file;

        it('should throw on parsing the file', function (done) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    throw err;
                }
                
                file = new File(data);
                
                file.on('error', function (error) {
                    assert.ok(/invalid midi/i.test(error.message));
                    done();
                });
                
                file.parse();
            });
        });
    });
});
