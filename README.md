[![npm version](https://img.shields.io/npm/v/midijs.svg) ![npm downloads](https://img.shields.io/npm/dm/midijs.svg)](https://www.npmjs.com/package/midijs)
[![build status](https://img.shields.io/travis/MattouFP/midijs.svg)](https://travis-ci.org/MattouFP/midijs)

# midijs

Read and write Standard MIDI files and enable communication with MIDI devices!

This module provides a high-level API for working with Standard MIDI and
General MIDI events that are sent through MIDI inputs and outputs, or
read from a file.

## Install

```sh
npm install --save midijs
```

## Usage

### File

Read or write data from or to a Standard MIDI file.  
Creating an empty file:

```js
var MIDI = require('midijs');
var file = new MIDI.File();

// file.header contains default header data
// file.tracks is empty
```

Loading data from an existing file, using the Buffer API:

```js
var MIDI = require('midijs');
var fs = require('fs');

fs.readFile(path, function (err, data) {
    if (err) {
        throw err;
    }

    var file = new MIDI.File(data, function (err) {
        if (err) {
            throw err;
        }
        
        // file.header contains header data
        // file.tracks contains file tracks
    });
});
```

Or using the Stream API:

```js
var MIDI = require('midijs');
var fs = require('fs');

var file = new MIDI.File();

file.on('parsed', function () {
    // file.header contains header data
    // file.tracks contains file tracks
});

file.on('error', function (err) {
    throw err;
});

fs.createReadStream(path).pipe(file);
```

Changing elements in a file:

```js
var MIDI = require('midijs');
var File = MIDI.File;

/** edit header **/

file.getHeader().setTicksPerBeat(60); // speed up twice
file.getHeader().setFileType(File.Header.FILE_TYPE.SINGLE_TRACK); // change file type

/** edit tracks **/

file.getTracks(); // get all tracks
file.getTrack(0); // get a track
file.removeTrack(0); // remove given track

// add a track with events
file.addTrack(2, // position (optional)
    new File.ChannelEvent(File.ChannelEvent.TYPE.NOTE_ON, {
        note: 45
    }),
    new File.MetaEvent(File.MetaEvent.TYPE.END_OF_TRACK)
);

/** edit events in a track **/

track.getEvents(); // get all events
track.getEvent(0); // get an event
track.removeEvent(0); // remove given event
track.addEvent(1, // position (optional)
    new File.ChannelEvent(File.ChannelEvent.TYPE.PROGRAM_CHANGE, {
        program: MIDI.programs.indexOf('organ_church')
    }, 0, 200)
);
```

Saving data to a SMF file, using the Buffer API:

```js
var MIDI = require('midijs');
var fs = require('fs');

var file = new MIDI.File();

// add/remove tracks or events...

file.getData(function (err, data) {
    if (err) {
        throw err;
    }
    
    fs.writeFile(path, data, function (err) {
        if (err) {
            throw err;
        }
        
        // file at 'path' now contains binary MIDI data
        // ready to be played by any other MIDI program
        // (or re-read by this module later)
    });
});
```

Or using the Stream API:

```js
var MIDI = require('midijs');
var fs = require('fs');

var file = new MIDI.File();

// add/remove tracks or events...

file.on('end', function () {
    // file at 'path' now contains binary MIDI data
    // ready to be played by any other MIDI program
    // (or re-read by this module later)
});

file.on('error', function (err) {
    throw err;
});

file.pipe(fs.createWriteStream(path));
```

### connect()

Access a MIDI driver that enables communication with the plugged MIDI
devices (outputs and inputs). This API is currently only available in
the browser. It relies on the [WebMIDI API](http://www.w3.org/TR/webmidi/)
and thus requires an authorization from the user.

If the user declines access to his MIDI devices, then the Promise fails.
Otherwise, it is fullfilled with a driver instance.  
Attempting to connect:

```js
var MIDI = require('midijs');

MIDI.connect()
    .then(function (driver) {
        // work with the outputs/inputs
    })
    .catch(function (error) {
        // something happened
    });
```

The driver is a bridge to output and input devices. It contains a list
of devices that are currently plugged in, and emits `connect` or
`disconnect` events whether one of them is connected or disconnected.

```js
var MIDI = require('midijs');

// driver.inputs is a list of current inputs
// driver.outputs is a list of current outputs

driver.on('connect', function (port) {
    if (port instanceof MIDI.connect.Input) {
        // an input just got plugged in
    } else {
        // it was an output
    }
});
```

You can send events to an output:

```js
var MIDI = require('midijs');
var ChannelEvent = MIDI.File.ChannelEvent;

output.send(new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
    note: 56,
    velocity: 127
}, 0));
```

And wait for events from an input:

```js
var MIDI = require('midijs');
var ChannelEvent = MIDI.File.ChannelEvent;

input.on('event', function (event) {
    if (event.type === ChannelEvent.TYPE.NOTE_ON) {
        // do something
    }
});
```

You can select a default input and a default output on the driver.
Events from the default input will bubble to the driver and events
sent to the driver will be sent to the default output.

```js
var MIDI = require('midijs');

driver.setInput(driver.inputs[2]); // by position
driver.setInput('Input id'); // by unique input ID

driver.setOutput(driver.outputs[2]); // by position
driver.setOutput('Output id'); // by unique output ID

// send a "note on" event to the default output
driver.send(new ChannelEvent(ChannelEvent.TYPE.NOTE_ON, {
    note: 56,
    velocity: 127
}, 0));

driver.on('event', function (event) {
    if (event.type === ChannelEvent.TYPE.NOTE_ON) {
        // "note on" event received from default input
    }
});
```

### programs

List of programs defined by the General MIDI standard.

### errors

Constructors of errors that can be emitted by this module.

## Commit convention

:book:      Documentation updates  
:bug:       Bug fixes  
:ledger:    Rename/move files  
:bulb:      Features  
:lipstick:  Fix coding style

## License

See LICENSE.