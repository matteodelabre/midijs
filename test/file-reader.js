'use strict';

var assert = require('assert');
var path = require('path');
var buffer = require('buffer');
var fs = require('fs');

var MIDI = require('../index');
var File = MIDI.File;
var error = MIDI.error;

var Header = File.Header;
var Track = File.Track;
var MetaEvent = File.MetaEvent;
var SysexEvent = File.SysexEvent;
var ChannelEvent = File.ChannelEvent;

// evaluate fixtures paths
var fixtures = path.join(__dirname, 'fixtures');
var genericFilePath = path.join(fixtures, 'file');
var txtFilePath = path.join(fixtures, 'notmidi.txt');
var filePath = genericFilePath + '.mid';
var undefinedFilePath = genericFilePath + '-invalid-undefined.mid';
var unknownFilePath = genericFilePath + '-invalid-unknown.mid';
var invalidMetaFilePath = genericFilePath + '-invalid-meta.mid';

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

            streamFile.on('error', done);
            streamFile.on('parsed', done);

            fs.createReadStream(filePath).pipe(streamFile);
        });

        it('should give the same results', function () {
            assert.deepEqual(bufferFile.getHeader(), streamFile.getHeader());
            assert.deepEqual(bufferFile.getTracks(), streamFile.getTracks());
        });
    });

    describe('file compliance', function () {
        var file;

        before(function (done) {
            file = new File();

            file.on('error', done);
            file.on('parsed', done);

            fs.createReadStream(filePath).pipe(file);
        });

        it('should parse header to correct structure', function () {
            var header = file.getHeader();

            assert.strictEqual(typeof header.getFileType(), 'number');
            assert.strictEqual(typeof header.getTicksPerBeat(), 'number');
        });

        it('should parse tracks to correct structure', function () {
            assert.ok(Array.isArray(file.getTracks()));
            assert.strictEqual(file.getTracks().length, file.getHeader()._trackCount);
        });

        it('should parse header with correct data', function () {
            var header = new Header(1, 2, 120);
            assert.deepEqual(file.getHeader(), header);
        });

        it('should parse tracks with correct data', function () {
            var expectedTracks = [
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

                    new MetaEvent(MetaEvent.TYPE.MIDI_CHANNEL, {
                        channel: 0
                    }),
                    new MetaEvent(MetaEvent.TYPE.MIDI_PORT, {
                        port: 42
                    }),
                    new MetaEvent(MetaEvent.TYPE.DEVICE_NAME, {
                        text: 'test device'
                    }),
                    new MetaEvent(MetaEvent.TYPE.INSTRUMENT_NAME, {
                        text: 'Church organ'
                    }),
                    new MetaEvent(MetaEvent.TYPE.PROGRAM_NAME, {
                        text: 'program name test'
                    }),
                    new ChannelEvent(ChannelEvent.TYPE.PROGRAM_CHANGE, {
                        program: MIDI.gm.getProgram('Church organ')
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
                    }),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 60,
                        velocity: 127
                    }, 0, 120),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
                        note: 60,
                        velocity: 127
                    }),

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
                    }),
                    new ChannelEvent(ChannelEvent.TYPE.NOTE_AFTERTOUCH, {
                        note: 60,
                        pressure: 50
                    }),

                    new ChannelEvent(ChannelEvent.TYPE.CHANNEL_AFTERTOUCH, {
                        pressure: 127
                    }, 0, 480),

                    new MetaEvent(MetaEvent.TYPE.MARKER, {
                        text: 'Pitch bend'
                    }, 480),
                    new ChannelEvent(ChannelEvent.TYPE.PITCH_BEND, {
                        value: -6000
                    }),

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
                    }),

                    new MetaEvent(MetaEvent.TYPE.END_OF_TRACK)
                ])
            ];

            file.getTracks().forEach(function (track, i) {
                var expectedEvents = expectedTracks[i].getEvents();

                track.getEvents().forEach(function (event, j) {
                    assert.deepEqual(event, expectedEvents[j]);
                });
            });
        });
    });

    describe('invalid files', function () {
        /**
         * Expect parsing a file to result into an error
         * 
         * @param {string} path - Path to the file to check
         * @param {Error} errorType - Constructor of the expected error
         */
        function expectInvalid(path, errorType) {
            return function (done) {
                var file;
    
                fs.readFile(path, function (err, data) {
                    if (err) {
                        throw err;
                    }
    
                    file = new File();
                    file.setData(data, function (e) {
                        assert.notStrictEqual(e, undefined);
                        assert.ok(e instanceof errorType);
                        
                        done();
                    });
                });
            };
        }
        
        it(
            'should throw when parsing non-MIDI files',
            expectInvalid(txtFilePath, error.MIDINotMIDIError)
        );
        
        it(
            'should throw with undefined events',
            expectInvalid(undefinedFilePath, error.MIDIParserError)
        );
        
        it(
            'should throw with unknown events',
            expectInvalid(unknownFilePath, error.MIDIParserError)
        );
        
        it(
            'should throw with invalid meta events',
            expectInvalid(invalidMetaFilePath, error.MIDIParserError)
        );
    });
});
