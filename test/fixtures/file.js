/**
 * MIDI file
 *
 * A script to generate well-formed MIDI files
 * in order to test if the information is preserved
 * across parsing and encoding
 */

'use strict';

var fs = require('fs');
var path = require('path');

var MIDI = require('../../index');
var File = MIDI.File;

var file = new File().track()
    .meta(File.META.SEQUENCE_NUMBER, {
        number: 0
    })
    .meta(File.META.SEQUENCE_NAME, {
        text: 'Meta track'
    })
    .meta(File.META.COPYRIGHT_NOTICE, {
        text: '© 2015, Mattéo DELABRE'
    })
    .meta(File.META.TEXT, {
        text: 'A fixture for testing all types of MIDI events in one file'
    })
    .meta(File.META.TIME_SIGNATURE, {
        numerator: 2,
        denominator: 4,
        metronome: 24,
        clockSignalsPerBeat: 8
    })
    .meta(File.META.KEY_SIGNATURE, {
        major: false,
        note: 3
    })
    .meta(File.META.SEQUENCER_SPECIFIC, {
        bytes: new Buffer('just testing out')
    })
    .meta(File.META.SET_TEMPO, {
        tempo: 240
    })
    .meta(File.META.SET_TEMPO, {
        tempo: 480
    }, 600)
.end().track()
    .meta(File.META.SEQUENCE_NUMBER, {
        number: 1
    })
    .meta(File.META.SEQUENCE_NAME, {
        text: 'Test song'
    })
    .meta(File.META.MIDI_CHANNEL, {
        channel: 0
    })
    .meta(File.META.MIDI_PORT, {
        port: 42
    })
    .meta(File.META.DEVICE_NAME, {
        text: 'test device'
    })
    .meta(File.META.INSTRUMENT_NAME, {
        text: 'Church organ'
    })
    .meta(File.META.PROGRAM_NAME, {
        text: 'program name test'
    })
    .channel(File.CHANNEL.PROGRAM_CHANGE, {
        program: MIDI.gm.getProgram('Church Organ')
    }, 0)
    .meta(File.META.SMPTE_OFFSET, {
        rate: 25,
        hours: 15,
        minutes: 53,
        seconds: 10,
        frames: 20,
        subframes: 50
    })
    .channel(File.CHANNEL.NOTE_ON, {
        note: 75,
        velocity: 127
    }, 0)
    .channel(File.CHANNEL.NOTE_ON, {
        note: 60,
        velocity: 127
    }, 0, 120)
    .channel(File.CHANNEL.NOTE_ON, {
        note: 60,
        velocity: 127
    }, 0)
    .meta(File.META.LYRICS, {
        text: 'test'
    })
    .meta(File.META.SET_TEMPO, {
        tempo: 60
    })
    .channel(File.CHANNEL.NOTE_AFTERTOUCH, {
        note: 75,
        pressure: 50
    }, 0, 480)
    .channel(File.CHANNEL.NOTE_AFTERTOUCH, {
        note: 60,
        pressure: 50
    }, 0)
    .channel(File.CHANNEL.NOTE_AFTERTOUCH, {
        note: 60,
        pressure: 50
    }, 0)
    .channel(File.CHANNEL.CHANNEL_AFTERTOUCH, {
        pressure: 127
    }, 0, 480)
    .meta(File.META.MARKER, {
        text: 'Pitch bend'
    }, 480)
    .channel(File.CHANNEL.PITCH_BEND, {
        value: -6000
    }, 0)
    .channel(File.CHANNEL.NOTE_OFF, {
        note: 75,
        velocity: 127
    }, 0, 480)
    .channel(File.CHANNEL.CONTROLLER, {
        controller: 123,
        value: 0
    }, 0, 480)
    .sysex(0, new Buffer('test'))
    .meta(File.META.CUE_POINT, {
        text: 'All sounds are stopped'
    }, 480)
    .channel(File.CHANNEL.PROGRAM_CHANGE, {
        program: 0
    }, 0)
.end();

fs.writeFile(path.join(__dirname, 'file.mid'), file.encode(), function (err) {
    if (err) {
        throw err;
    }

    console.log('file written');
});
