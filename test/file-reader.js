'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');

var MIDI = require('../index');
var Header = MIDI.File.Header;
var Track = MIDI.File.Track;
var MetaEvent = MIDI.File.MetaEvent;
var ChannelEvent = MIDI.File.ChannelEvent;

var fixtures = path.join(__dirname, 'fixtures');
var filePath = path.join(fixtures, 'file.mid');
var invalidFilePath = path.join(fixtures, 'invalid-file.mid');

describe('File as a reader', function () {
    describe('loading APIs', function () {
        var bufferFile, streamFile;
        
        it('should load with buffers', function (done) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    throw err;
                }

                bufferFile = new MIDI.File(data);
                bufferFile.parse(done);
            });
        });
        
        it('should load with streams', function (done) {
            streamFile = new MIDI.File();
            streamFile.on('parsed', done);

            fs.createReadStream(filePath).pipe(streamFile);
        });
        
        it('should give the same results', function () {
            assert.deepEqual(bufferFile.header, streamFile.header);
            assert.deepEqual(bufferFile.tracks, streamFile.tracks);
        });
    });
    
    describe('file compliance', function () {
        var file;
        
        before(function (done) {
            file = new MIDI.File();
            file.on('parsed', done);

            fs.createReadStream(filePath).pipe(file);
        });
        
        it('should parse header to correct structure', function () {
            assert.strictEqual(typeof file.header.fileType, 'number');
            assert.strictEqual(typeof file.header.ticksPerBeat, 'number');
            assert.strictEqual(typeof file.header.trackCount, 'number');
        });
        
        it('should parse tracks to correct structure', function () {
            assert.ok(Array.isArray(file.tracks));
            assert.strictEqual(file.tracks.length, file.header.trackCount);
        });
        
        it('should parse header with correct data', function () {
            var header = new Header(1, 2, 480);
            assert.deepEqual(file.header, header);
        });
        
        it('should parse tracks with correct data', function () {
            var tracks = [
                new Track(
                    new MetaEvent(MetaEvent.TYPE.INSTRUMENT_NAME, {
                        text: ''
                    }),
                    new MetaEvent(MetaEvent.TYPE.SET_TEMPO, {
                        tempo: 120
                    }),
                    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NAME, {
                        text: 'Sequence Name'
                    }),
                    new MetaEvent(MetaEvent.TYPE.END_OF_TRACK)
                ),
                new Track(
                    new MetaEvent(MetaEvent.TYPE.INSTRUMENT_NAME, {
                        text: 'Acoustic Grand Piano'
                    }),
                    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NAME, {
                        text: 'My New Track'
                    }),
                    new ChannelEvent(ChannelEvent.TYPE.CONTROLLER, {
                        controller: 7,
                        value: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.PROGRAM_CHANGE, {
                        program: 1
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 64,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 64,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 66,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 66,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 68,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 68,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 69,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 69,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 71,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 71,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 73,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 73,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 75,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 75,
                        velocity: 127
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 76,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 76,
                        velocity: 127
                    }, 0, 480),
                    new MetaEvent(MetaEvent.TYPE.END_OF_TRACK)
                )
            ];
            
            file.tracks.forEach(function (track, i) {
                track.events.forEach(function (event, j) {
                    assert.deepEqual(event, tracks[i].events[j]);
                });
            });
        });
    });
    
    describe('invalid files', function () {
        it('should throw when parsing invalid files', function (done) {
            var file;
            
            fs.readFile(invalidFilePath, function (err, data) {
                if (err) {
                    throw err;
                }
                
                file = new MIDI.File(data);
                
                file.on('error', function (error) {
                    assert.ok(/invalid midi/i.test(error.message));
                    done();
                });
                
                file.parse();
            });
        });
    });
});
