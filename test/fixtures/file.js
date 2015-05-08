/**
 * MIDI file
 * 
 * A script to generate well-formed MIDI files
 * in order to test if the information is preserved
 * across parsing and encoding
 */

'use strict';

var fs = require('fs');
var buffer = require('buffer');

var MIDI = require('../../index');
var File = MIDI.File;

var MetaEvent = File.MetaEvent;
var SysexEvent = File.SysexEvent;
var ChannelEvent = File.ChannelEvent;

var file = new File();

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
        text: 'A fixture for testing all types of MIDI events in one file'
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
).addTrack(
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
        program: MIDI.gm.getProgram('Church Organ')
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
);

file.pipe(fs.createWriteStream('file.mid'));
file.on('end', function () {
    console.log('file written');
});
