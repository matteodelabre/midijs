'use strict';

var assert = require('assert');
var path = require('path');
var buffer = require('buffer');
var fs = require('fs');

var MIDI = require('../index');
var File = MIDI.File;
var Header = File.Header;
var Track = File.Track;

var MetaEvent = File.MetaEvent;
var SysexEvent = File.SysexEvent;
var ChannelEvent = File.ChannelEvent;

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

                bufferFile = new File(data, done);
            });
        });
        
        it('should load with streams', function (done) {
            streamFile = new File();
            
            streamFile.on('finish', done);
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
            file = new File();
            
            file.on('finish', done);
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
            var header = new Header(1, 2, 120);
            assert.deepEqual(file.header, header);
        });
        
        it('should parse tracks with correct data', function () {
            var tracks = [
                new Track([
                    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NUMBER, {
                        number: 0
                    }),
                    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NAME, {
                        text: 'Meta track'
                    }),
                    new MetaEvent(MetaEvent.TYPE.COPYRIGHT_NOTICE, {
                        text: '© 2015, Mattéo DELABRE'
                    }),
                    new MetaEvent(MetaEvent.TYPE.TEXT, {
                        text: 'A fixture for testing all types ' +
                              'of MIDI events in one file'
                    }),
                    new MetaEvent(MetaEvent.TYPE.TIME_SIGNATURE, {
                        numerator: 2,
                        denominator: 4,
                        metronome: 24,
                        clockSignalsPerBeat: 8
                    }),
                    new MetaEvent(MetaEvent.TYPE.KEY_SIGNATURE, {
                        major: false,
                        note: 3
                    }),
                    new MetaEvent(MetaEvent.TYPE.SEQUENCER_SPECIFIC, {
                        data: new buffer.Buffer('just testing out')
                    }),

                    new MetaEvent(MetaEvent.TYPE.SET_TEMPO, {
                        tempo: 240
                    }),
                    new MetaEvent(MetaEvent.TYPE.SET_TEMPO, {
                        tempo: 480
                    }, 600),

                    new MetaEvent(MetaEvent.TYPE.END_OF_TRACK)
                ]),
                new Track([
                    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NUMBER, {
                        number: 1
                    }),
                    new MetaEvent(MetaEvent.TYPE.SEQUENCE_NAME, {
                        text: 'Test song'
                    }),

                    new MetaEvent(MetaEvent.TYPE.CHANNEL_PREFIX, {
                        channel: 0
                    }),
                    new MetaEvent(MetaEvent.TYPE.INSTRUMENT_NAME, {
                        text: 'Church organ'
                    }),
                    new ChannelEvent(ChannelEvent.TYPE.PROGRAM_CHANGE, {
                        program: MIDI.programs.indexOf('organ_church')
                    }, 0),

                    new MetaEvent(MetaEvent.TYPE.SMPTE_OFFSET, {
                        rate: 25,
                        hours: 15,
                        minutes: 53,
                        seconds: 10,
                        frames: 20,
                        subframes: 50
                    }),

                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 75,
                        velocity: 127
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 60,
                        velocity: 127
                    }, 0, 120),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 60,
                        velocity: 127
                    }, 0),

                    new MetaEvent(MetaEvent.TYPE.LYRICS, {
                        text: 'test'
                    }),
                    new MetaEvent(MetaEvent.TYPE.SET_TEMPO, {
                        tempo: 60
                    }),

                    new ChannelEvent(ChannelEvent.TYPE.NOTE_AFTERTOUCH, {
                        note: 75,
                        pressure: 50
                    }, 0, 480),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_AFTERTOUCH, {
                        note: 60,
                        pressure: 50
                    }, 0),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_AFTERTOUCH, {
                        note: 60,
                        pressure: 50
                    }, 0),

                    new ChannelEvent(ChannelEvent.TYPE.CHANNEL_AFTERTOUCH, {
                        pressure: 127
                    }, 0, 480),

                    new MetaEvent(MetaEvent.TYPE.MARKER, {
                        text: 'Pitch bend'
                    }, 480),
                    new ChannelEvent(ChannelEvent.TYPE.PITCH_BEND, {
                        value: -6000
                    }, 0),

                    new ChannelEvent(ChannelEvent.TYPE.NOTE_OFF, {
                        note: 75,
                        velocity: 127
                    }, 0, 480),

                    new ChannelEvent(ChannelEvent.TYPE.CONTROLLER, {
                        controller: 123,
                        value: 0
                    }, 0, 480),
                    
                    new SysexEvent(0, new buffer.Buffer('test')),

                    new MetaEvent(MetaEvent.TYPE.CUE_POINT, {
                        text: 'All sounds are stopped'
                    }, 480),
                    new ChannelEvent(ChannelEvent.TYPE.PROGRAM_CHANGE, {
                        program: 0
                    }, 0),

                    new MetaEvent(MetaEvent.TYPE.END_OF_TRACK)
                ])
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
                
                file = new File();
                file.setData(data, function (err) {
                    assert.notStrictEqual(err, undefined);
                    assert.ok(/invalid midi/i.test(err.message));
                    done();
                });
            });
        });
    });
});
