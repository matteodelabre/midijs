'use strict';

var assert = require('assert');
var path = require('path');
var buffer = require('buffer');
var bufferEqual = require('buffer-equal');
var fs = require('fs');

var MIDI = require('../index');
var File = MIDI.File;
var error = MIDI.error;

var MetaEvent = File.MetaEvent;
var SysexEvent = File.SysexEvent;
var ChannelEvent = File.ChannelEvent;

var fixtures = path.join(__dirname, 'fixtures');
var filePath = path.join(fixtures, 'file.mid');

describe('File as a writer', function () {
    describe('creation API', function () {
        var file, header, tracks;

        before(function () {
            file = new File();
            header = file.getHeader();
            tracks = file.getTracks();
        });

        it('should create a new file', function () {
            assert.strictEqual(header._trackCount, 0);
            assert.ok(Array.isArray(tracks));
            assert.strictEqual(tracks.length, header._trackCount);
        });

        it('should have header methods', function () {
            assert.strictEqual(typeof header.getFileType(), 'number');
            assert.strictEqual(typeof header.getTicksPerBeat(), 'number');

            assert.strictEqual(
                header
                    .setFileType(File.Header.FILE_TYPE.SINGLE_TRACK)
                    .setFileType(File.Header.FILE_TYPE.SYNC_TRACKS)
                    .setFileType(File.Header.FILE_TYPE.ASYNC_TRACKS),
                header
            );

            assert.strictEqual(
                header
                    .setTicksPerBeat(120)
                    .setTicksPerBeat(60),
                header
            );

            assert.strictEqual(
                header.getFileType(),
                File.Header.FILE_TYPE.ASYNC_TRACKS
            );

            assert.strictEqual(header.getTicksPerBeat(), 60);
        });

        it('should throw with wrong values', function () {
            assert.throws(function () {
                header.setFileType(-1);
            }, error.MIDIInvalidArgument);

            assert.throws(function () {
                header.setTicksPerBeat(0);
            }, error.MIDIInvalidArgument);

            assert.throws(function () {
                header.setTicksPerBeat(65536);
            }, error.MIDIInvalidArgument);
        });

        it('should add tracks', function () {
            file.addTrack(0, new MetaEvent(MetaEvent.TYPE.END_OF_TRACK));
            file.addTrack(new MetaEvent(MetaEvent.TYPE.SET_TEMPO));
            file.addTrack(2, []);
            file.addTrack([
                new ChannelEvent(ChannelEvent.TYPE.CHANNEL_AFTERTOUCH)
            ]);
        });

        it('should add events', function () {
            var track = file.getTrack(2), events, expectedEvents = [
                new MetaEvent(MetaEvent.TYPE.SEQUENCE_NUMBER, {
                    number: 2
                }),
                new MetaEvent(MetaEvent.TYPE.SEQUENCE_NAME, {
                    text: 'Optional'
                }),
                new MetaEvent(MetaEvent.TYPE.END_OF_TRACK)
            ];

            track.addEvent(expectedEvents[2]);
            track.addEvent(0, expectedEvents[0]);
            track.addEvent(1, expectedEvents[1]);

            events = track.getEvents();
            events.forEach(function (event, i) {
                assert.deepEqual(event, expectedEvents[i]);
            });

            expectedEvents.forEach(function (event, i) {
                assert.deepEqual(event, track.getEvent(i));
            });
        });

        it('should remove events', function () {
            var track = file.getTrack(2);

            track.removeEvent(0);
            assert.strictEqual(track.getEvents().length, 2);
            track.removeEvent();
            assert.strictEqual(track.getEvents().length, 1);

            assert.strictEqual(
                track.getEvent(0).type,
                MetaEvent.TYPE.SEQUENCE_NAME
            );
        });

        it('should remove tracks', function () {
            file.removeTrack(2);
            assert.strictEqual(file.getTracks().length, 3);
            file.removeTrack(2);
            assert.strictEqual(file.getTracks().length, 2);
            file.removeTrack();
            assert.strictEqual(file.getTracks().length, 1);

            assert.strictEqual(
                file.getTrack(0).getEvent(0).type,
                MetaEvent.TYPE.END_OF_TRACK
            );
        });

        it('should throw with unknown events', function () {
            assert.throws(function () {
                return new ChannelEvent('unknown type!!!');
            }, error.MIDIInvalidEventError);

            assert.throws(function () {
                return new MetaEvent('unknown type!!!');
            }, error.MIDIInvalidEventError);
        });
    });

    describe('encoding APIs', function () {
        var file, encodedBuffers, encodedStreams;

        before(function () {
            file = new File();

            file.addTrack(
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
            );

            file.addTrack([
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
            ]);
        });

        it('should encode with buffers', function (done) {
            file.getData(function (err, data) {
                if (err) {
                    done(err);
                    return;
                }

                encodedBuffers = data;
                done();
            });
        });

        it('should encode with streams', function (done) {
            var data = [];

            file.on('data', function (chunk) {
                data.push(chunk);
            });

            file.on('error', function (err) {
                done(err);
            });

            file.on('end', function () {
                encodedStreams = buffer.Buffer.concat(data);
                done();
            });
        });

        it('should give the same results', function () {
            assert.ok(bufferEqual(encodedBuffers, encodedStreams));
        });

        it('should equal reference file', function (done) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    done(err);
                    return;
                }

                assert.ok(bufferEqual(encodedBuffers, data));
                assert.ok(bufferEqual(encodedStreams, data));
                done();
            });
        });
    });

    describe('invalid files', function () {
        var file;

        beforeEach(function () {
            file = new File();
            file.addTrack();
        });

        it('should throw with unknown meta events', function (done) {
            var event = new MetaEvent(MetaEvent.TYPE.MIDI_CHANNEL);
            event.type = 'unknown type!!!'; // dirty hack

            file.getTrack(0).addEvent(event);
            file.getData(function (err) {
                assert.ok(err);
                assert.ok(err instanceof error.MIDIEncoderError);
                done();
            });
        });

        it('should throw with unknown channel events', function (done) {
            var event = new ChannelEvent(ChannelEvent.TYPE.NOTE_AFTERTOUCH);
            event.type = 'unknown type!!!'; // dirty hack

            file.getTrack(0).addEvent(event);
            file.getData(function (err) {
                assert.ok(err);
                assert.ok(err instanceof error.MIDIEncoderError);
                done();
            });
        });

        it('should throw with unknown events', function (done) {
            file.getTrack(0).addEvent({}); // add a generic object as an event
            file.getData(function (err) {
                assert.ok(err);
                assert.ok(err instanceof error.MIDIEncoderError);
                done();
            });
        });
    });
});
