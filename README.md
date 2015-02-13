# midijs

Read and write Standard MIDI files, and enable communication with MIDI devices through a high-level API on top of the WebMIDI api.

## Usage

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