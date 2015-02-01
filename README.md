# midijs

Read and write Standard MIDI files and provide a set of tools to work with General MIDI, in the browser or in Node.

## API

1. [Reader](#reader)
2. [Writer](#writer)
3. [connect()](#connect)
4. [programs](#programs)

### Reader

Reads Standard MIDI file data provided as a string or as a Buffer.  
Example:

```js
var MIDI = require('midijs');
var fs = require('fs');

fs.readFile(path, function (err, data) {
    if (err) {
        throw err;
    }

    var file = new MIDI.Reader(data);
    
    file.parse(function (err) {
        if (err) {
            throw err;
        }
        
        // do something with MIDI data
    });
});
```

It can also be used as a writable stream:

```js
var MIDI = require('midijs');
var fs = require('fs');

var file = new MIDI.Reader();

file.on('parsed', function () {
    // do something with MIDI data
});

file.on('error', function (err) {
    throw err;
});

fs.createReadStream(path).pipe(file);
```

Attributes of the instance:

* `header (ChunkHeader)`: header data.
* `tracks (Array[ChunkTrack])`: file tracks.

#### Chunk

Represents a MIDI chunk.

* `type (String)`: chunk identifier (either `MTrk` or `MThd`).
* `length (Number)`: chunk length in bytes.

#### ChunkHeader (Chunk)

Represents the file's header.

* `fileType (Number)`: MIDI file type. 0 means that all the events are contained in one track. 1 means that all the events are contained in several tracks meant to be played simultaneously. 2 means that all the events are contained in several tracks meant to be played separately.
* `trackCount (Number)`: amount of tracks.
* `ticksPerBeat (Number)`: number of ticks in one beat (one quarter-note).

#### ChunkTrack (Chunk)

Represents a MIDI track in the file.

* `events (Array[Event])`: list of events in the track.

#### Event

Represents a MIDI event in a track.

* `delay (Number)`: time to wait before playing this event, relative to the time of the previous event, in ticks.

#### EventMeta (Event)

Represents a meta event. This type of event only occurs in Standard MIDI files and are not transmitted to MIDI devices. They are only meant to contain metadata about the file.

* `type (String)`: litteraly `'meta'`.
* `subtype (String)`: type of metadata contained. See following sub-sections.

##### sequenceNumber

Pattern number of this track. Should always be at the start of a track, with a delay of `0`.

* `number (Number)`: the pattern number.

##### text

Arbitrary text (comments, notes, ...). Usually ASCII text.

* `text (String)`: the text.

##### copyrightNotice

Copyright of this file (© YYYY, Author). Should always be at the start of the first track, with a delay of `0`.

* `text (String)`: the copyright.

##### sequenceName

Name of the track. Should always be at the start of a track, with a delay of `0`.

* `text (String)`: the track name.

##### instumentName

Name of the instrument used in this track. Can be following a `channelPrefix` meta event if this applies only to a channel. Rarely used, in favour of using the `programChange` channel event.

* `text (String)`: the instrument name.

##### lyrics

Lyrics to be sung at this time in the song.

* `text (String)`: the lyrics.

##### marker

Marks a significant point in the song.

* `text (String)`: marker details.

##### cuePoint

Marks a point where some type of action should start.

* `text (String)`: details about the action.

##### channelPrefix

Links the following meta events to a channel. Its effects are cancelled by another channel prefix or any non-meta event.

* `channel (Number)`: channel identifier.

##### endOfTrack

Indicates the end of the track.

##### setTempo

Changes the tempo for the next events delays.

* `tempo (Number)`: tempo in microseconds per beat.

##### smpteOffset

Sets the SMPTE starting point relative to the beginning of the track.

* `rate (Number)`: frame rate (24, 25, 30 fps).
* `hours (Number)`: hour offset (0 - 23).
* `minutes (Number)`: minute offset (0 - 59).
* `seconds (Number)`: second offset (0 - 59).
* `frames (Number)`: frame offset (0 - `rate`).
* `subframes (Number)`: subframe offset (0 - 99).

##### timeSignature

Changes the time signature. May occur several times in a track, or once in the first track (format 1), or once in each track (format 2). If none is provided the defaults are 4, 4, 24 and 8.

* `numerator (Number)`: numerator of the time signature.
* `denominator (Number)`: denominator of the time signature.
* `metronome (Number)`: metronome frequency in number of clock signals per click.
* `clockSignalsPerBeat (Number)`: amount of clock signals in one beat.

##### keySignature

Changes the key signature.

* `major (Boolean)`: whether the key signature is major or minor.
* `note (Number)`: number of sharps (if positive), or number of flats (if negative).

##### sequencerSpecific

Contains data that is specific to the sequencer that produced this file.

* `data (Buffer)`: message bytes.

#### EventChannel (Event)

Represents a channel event. These events change the state of channels by setting notes on, off, changing controllers parameters or channel programs. They can be transmitted to the MIDI devices.

* `type (String)`: litteraly `'channel'`.
* `subtype (String)`: type of channel event contained. See following sub-sections.
* `channel (Number)`: channel affected by this event.

##### noteOff

Sets a note off.

* `note (Number)`: note number to release (0 - 127).
* `velocity (Number)`: velocity of the release (usually 0).

##### noteOn

Sets a note on.

* `note (Number)`: note number to press (0 - 127).
* `velocity (Number)`: velocity of the pressure (0 - 127).

##### noteAftertouch

Changes the pressure on a note.

* `note (Number)`: note number (0 - 127).
* `pressure (Number)`: pressure applied on the note (0 - 127).

##### controller

Sets the value of a controller.

* `controller (Number)`: controller ID.
* `value (Number)`: new controller value.

##### programChange

Changes the program on the channel.

* `program (Number)`: program ID (see program list in programs object).

##### channelAftertouch

Changed the global pressure on a channel.

* `pressure (Number)`: pressure applied on the channel (0 - 127).

##### pitchBend

Changes the pitch on the channel.

* `value (Number)`: pitch variation (-8192 - 8191), negative values should reduce the pitch, positive values should increase the pitch. The meaning of the value is device-dependent, but 8191 generally means 2 semi-tones.

#### EventSysex (Event)

Represents a system exclusive event. These events can have various meanings from device to device, and are defined by the manufacturer's specification. This API only expose the raw bytes of the message, not trying to interpret them.

* `type (String)`: litteraly `'sysex'`.
* `subtype (Number)`: 240 or 247.
* `data (Buffer)`: raw sysex bytes.

### Writer

Writes data to a Standard MIDI file. This API is still to come.

### connect()

Provides access to the MIDI driver, enabling communication with the plugged MIDI
devices (outputs and inputs).
Example:

```js
connect()
    .then(function (driver) {
        // work with the outputs/inputs
    })
    .catch(function (error) {
        // something happened
    });
```

It will fail if the user declines access to MIDI devices. This API is only available
in the browser. An ES6 Promise instance is returned.

#### Driver

Wraps around native MIDI access. Allows to select a default input from which
the event bubble or a default output to which the events are send.

* `outputs (Array)`: list of available outputs.
* `output (Output|null)`: currently selected default output.
* `inputs (Array)`: list of available inputs.
* `input (Input|null)`: currently selected default input.

This object is an EventEmitter. It can emit the following events:

* `connect (port: Input|Output)`: when a new device is plugged in.
* `disconnect (port: Input|Output)`: when a device is disconnected.
* `event (event: EventChannel)`: when the default input emits an event.

The `outputs` and `inputs` arrays are dynamically updated when devices
are connected or disconnected.

##### setInput(input)

Set default input.

* `input (String|Input|MIDIInput)`: the default input to select, by unique ID, or by native instance, or by wrapped instance.

##### setOutput(output)

Set default output.

* `output (String|Output|MIDIOutput)`: the default output to select, by unique ID, or by native instance, or by wrapped instance.

##### send(event)

Send an event to the default output.

* `event (EventChannel)`: event to transmit.

#### Output

Wraps the `send` method to take `EventChannel` instances as an argument.

* `native`: reference to the native output.

##### send(event)

Send an event to this output.

* `event (EventChannel)`: event to transmit.

#### Input

Wraps the `midimessage` event to take `EventChannel` instances as an argument.

* `native`: reference to the native output.

This object is an EventEmitter. It can emit the following events:

* `event (event: EventChannel)`: when the native input emits an event.

### programs

List of programs defined by the General MIDI standard.

## Commit convention

:book:      Documentation updates  
:bug:       Bug fixes  
:ledger:    Rename/move files  
:bulb:      Features  
:lipstick:  Fix coding style

## License

See LICENSE.