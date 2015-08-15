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

var File = require('../../index').File;
var file = new File().track()
    .meta('sequence number', {
        number: 0
    })
    .meta('sequence name', {
        text: 'Meta track'
    })
    .meta('copyright notice', {
        text: '© 2015, Mattéo DELABRE'
    })
    .meta('text', {
        text: 'A fixture for testing all types of MIDI events in one file'
    })
    .meta('time signature', {
        numerator: 2,
        denominator: 4,
        metronome: 24,
        clockSignalsPerBeat: 8
    })
    .meta('key signature', {
        major: false,
        note: 3
    })
    .meta('sequencer specific', {
        bytes: new Buffer('just testing out')
    })
    .meta('set tempo', {
        tempo: 240
    })
    .meta('set tempo', {
        tempo: 480
    }, 600)
.end().track()
    .meta('sequence number', {
        number: 1
    })
    .meta('sequence name', {
        text: 'Test song'
    })
    .meta('device name', {
        text: 'test device'
    })
    .meta('instrument name', {
        text: 'Church organ'
    })
    .meta('program name', {
        text: 'program name test'
    })
    .channel('program change', {
        instrument: 'Church Organ'
    }, 0)
    .meta('SMPTE offset', {
        rate: 25,
        hours: 15,
        minutes: 53,
        seconds: 10,
        frames: 20,
        subframes: 50
    })
    .channel('note on', {
        note: 75,
        velocity: 127
    }, 0)
    .channel('note on', {
        note: 60,
        velocity: 127
    }, 0, 120)
    .channel('note on', {
        note: 60,
        velocity: 127
    }, 0)
    .meta('lyrics', {
        text: 'test'
    })
    .meta('set tempo', {
        tempo: 60
    })
    .channel('note aftertouch', {
        note: 75,
        pressure: 50
    }, 0, 480)
    .channel('note aftertouch', {
        note: 60,
        pressure: 50
    }, 0)
    .channel('note aftertouch', {
        note: 60,
        pressure: 50
    }, 0)
    .channel('channel aftertouch', {
        pressure: 127
    }, 0, 480)
    .meta('marker', {
        text: 'Pitch bend'
    }, 480)
    .channel('pitch bend', {
        value: -6000
    }, 0)
    .channel('note off', {
        note: 75,
        velocity: 127
    }, 0, 480)
    .channel('controller', {
        type: 'all notes off',
        value: 0
    }, 0, 480)
    .sysex('type 1', new Buffer('test'))
    .meta('cue point', {
        text: 'All sounds are stopped'
    }, 480)
    .channel('program change', {
        instrument: 'Acoustic Grand Piano'
    }, 0)
.end();

fs.writeFile(path.join(__dirname, 'song.mid'), file.encode(), function (err) {
    if (err) {
        throw err;
    }

    console.log('file written');
});
