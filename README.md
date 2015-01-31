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
fs.readFile(path, function (err, data) {
    if (err) {
        throw err;
    }

    var file = new FileReader(data);
    
    // do something with MIDI data
});
```

Attributes:

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

Provides access to the MIDI driver, enabling communication with the first MIDI
output. In the future, it will allow selecting a specific output or allow communicating
with inputs.  
Example:

```js
connect()
    .then(function (output) {
        // work with the output
    })
    .catch(function (error) {
        // something happened
    });
```

This function works both in the browser thanks to the Web MIDI API (only in Chrome at the moment),
and in Node. It may fail in the browser if the user declines access to MIDI devices. It will
also fail if there is no available MIDI output.

An ES6 Promise instance is returned.

#### Output

Wraps around native outputs. The native outputs only have a `send` method, this object provides
a high-level API to send MIDI messages.

* `native`: reference to the native output.

##### noteOff(channel, note, velocity, delay)

Sets a note off.

* `channel (Number)`: channel ID.
* `note (Number)`: note number to release (0 - 127).
* `velocity (Number)`: velocity of the release (usually 0).
* `delay (Number)`: delay in milliseconds for this event.

##### noteOn(channel, note, velocity, delay)

Sets a note on.

* `channel (Number)`: channel ID.
* `note (Number)`: note number to press (0 - 127).
* `velocity (Number)`: velocity of the pressure (usually 0).
* `delay (Number)`: delay in milliseconds for this event.

##### noteAftertouch(channel, note, pressure, delay)

Changes the pressure on a note.

* `channel (Number)`: channel ID.
* `note (Number)`: note number (0 - 127).
* `pressure (Number)`: pressure applied on the note (0 - 127).
* `delay (Number)`: delay in milliseconds for this event.

##### controller(channel, controller, value, delay)

Sets the value of a controller.

* `channel (Number)`: channel ID.
* `controller (Number)`: controller ID.
* `value (Number)`: new controller value.
* `delay (Number)`: delay in milliseconds for this event.

##### programChange(channel, program, delay)

Changes the program on the channel.

* `channel (Number)`: channel ID.
* `program (Number)`: program ID (see program list in programs object).
* `delay (Number)`: delay in milliseconds for this event.

##### channelAftertouch(channel, pressure, delay)

Changed the global pressure on a channel.

* `channel (Number)`: channel ID.
* `pressure (Number)`: pressure applied on the channel (0 - 127).
* `delay (Number)`: delay in milliseconds for this event.

##### pitchBend(channel, value, delay)

Changes the pitch on the channel.

* `channel (Number)`: channel ID.
* `value (Number)`: pitch variation (-8192 - 8191), negative values should reduce the pitch, positive values should increase the pitch. The meaning of the value is device-dependent, but 8191 generally means 2 semi-tones.
* `delay (Number)`: delay in milliseconds for this event.

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