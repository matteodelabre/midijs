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
    .meta('SEQUENCE_NUMBER', {
        number: 0
    })
    .meta('SEQUENCE_NAME', {
        text: 'Meta track'
    })
    .meta('COPYRIGHT_NOTICE', {
        text: '© 2015, Mattéo DELABRE'
    })
    .meta('TEXT', {
        text: 'A fixture for testing all types of MIDI events in one file'
    })
    .meta('TIME_SIGNATURE', {
        numerator: 2,
        denominator: 4,
        metronome: 24,
        clockSignalsPerBeat: 8
    })
    .meta('KEY_SIGNATURE', {
        major: false,
        note: 3
    })
    .meta('SEQUENCER_SPECIFIC', {
        bytes: new Buffer('just testing out')
    })
    .meta('SET_TEMPO', {
        tempo: 240
    })
    .meta('SET_TEMPO', {
        tempo: 480
    }, 600)
.end().track()
    .meta('SEQUENCE_NUMBER', {
        number: 1
    })
    .meta('SEQUENCE_NAME', {
        text: 'Test song'
    })
    .meta('MIDI_CHANNEL', {
        channel: 0
    })
    .meta('MIDI_PORT', {
        port: 42
    })
    .meta('DEVICE_NAME', {
        text: 'test device'
    })
    .meta('INSTRUMENT_NAME', {
        text: 'Church organ'
    })
    .meta('PROGRAM_NAME', {
        text: 'program name test'
    })
    .channel('PROGRAM_CHANGE', {
        program: MIDI.gm.getProgram('Church Organ')
    }, 0)
    .meta('SMPTE_OFFSET', {
        rate: 25,
        hours: 15,
        minutes: 53,
        seconds: 10,
        frames: 20,
        subframes: 50
    })
    .channel('NOTE_ON', {
        note: 75,
        velocity: 127
    }, 0)
    .channel('NOTE_ON', {
        note: 60,
        velocity: 127
    }, 0, 120)
    .channel('NOTE_ON', {
        note: 60,
        velocity: 127
    }, 0)
    .meta('LYRICS', {
        text: 'test'
    })
    .meta('SET_TEMPO', {
        tempo: 60
    })
    .channel('NOTE_AFTERTOUCH', {
        note: 75,
        pressure: 50
    }, 0, 480)
    .channel('NOTE_AFTERTOUCH', {
        note: 60,
        pressure: 50
    }, 0)
    .channel('NOTE_AFTERTOUCH', {
        note: 60,
        pressure: 50
    }, 0)
    .channel('CHANNEL_AFTERTOUCH', {
        pressure: 127
    }, 0, 480)
    .meta('MARKER', {
        text: 'Pitch bend'
    }, 480)
    .channel('PITCH_BEND', {
        value: -6000
    }, 0)
    .channel('NOTE_OFF', {
        note: 75,
        velocity: 127
    }, 0, 480)
    .channel('CONTROLLER', {
        controller: 123,
        value: 0
    }, 0, 480)
    .sysex('TYPE_1', new Buffer('test'))
    .meta('CUE_POINT', {
        text: 'All sounds are stopped'
    }, 480)
    .channel('PROGRAM_CHANGE', {
        program: 0
    }, 0)
.end();

fs.writeFile(path.join(__dirname, 'file.mid'), file.encode(), function (err) {
    if (err) {
        throw err;
    }

    console.log('file written');
});
