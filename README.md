# midijs

Parser and encoder for MIDI events and Standard MIDI files.

[![npm version](https://img.shields.io/npm/v/midijs.svg?style=flat-square)](https://www.npmjs.com/package/midijs)
[![npm downloads](https://img.shields.io/npm/dm/midijs.svg?style=flat-square)](https://www.npmjs.com/package/midijs)
[![build status](https://img.shields.io/travis/matteodelabre/midijs.svg?style=flat-square)](https://travis-ci.org/matteodelabre/midijs)
[![coverage](https://img.shields.io/coveralls/matteodelabre/midijs.svg?style=flat-square)](https://coveralls.io/github/matteodelabre/midijs)
[![dependencies status](http://img.shields.io/david/matteodelabre/midijs.svg?style=flat-square)](https://david-dm.org/matteodelabre/midijs)

## Quick start

Using this module, you can easily work with
MIDI events and Standard MIDI files. It exposes
a easily-readable, high-level API for manipulating
MIDI data, and even creating MIDI files
_right from your code!_

**NOTE:** this module does not provide access to the devices by itself,
but enables you to handle the stream of events that are sent
to or received from them. Use this module in conjunction with the
[WebMIDI API](http://www.w3.org/TR/webmidi/) in the browser,
or [`node-midi`](http://npmjs.com/package/midi) with Node.JS for this purpose.

### Install

This is a module for JavaScript. Start using it with npm.

```sh
npm install --save midijs
```

### Examples

Here are a few common things that you can do with the help of this module.  
You can send an event to any MIDI device (e.g. your piano keyboard), without
writing raw MIDI data,

```js
var midijs = require('midijs');
var ChannelEvent = midijs.events.ChannelEvent;
var ctx = new midijs.events.Context({
    device: true // this informs the parser that we are working with a device
});

// using the WebMIDI API
output.send(ctx.encode(new ChannelEvent('controller', {
    type: 'all sound off',
    value: 127
})));

// using `node-midi`
output.sendMessage(ctx.encode(new ChannelEvent('controller', {
    type: 'all sound off',
    value: 127
})));
```

and receive events from the same device as easily.

```js
var midijs = require('midijs');
var ctx = new midijs.events.Context({
    device: true
});

// using the WebMIDI API
input.onmidimessage = function (signal) {
    var event = ctx.decode(signal.data);

    // `event` represents the received event
    // `signal.timestamp` is a timestamp for sending time
};

// using `node-midi`
input.on('event', function (timestamp, data) {
    var event = ctx.decode(data);

    // `event` represents the received event
    // `timestamp` is for sending time
});
```

You can also read MIDI files as a list of tracks containing events.
This parser supports meta events that provide information about the
file itself. Here's how you would read a file named `Ode to Joy.mid`.

```js
var midijs = require('midijs');
var fs = require('fs');

fs.readFile('Ode to Joy.mid', function (err, data) {
    var tune;

    if (err) {
        throw err;
    }

    tune = midijs.File.decode(data);
    tune.tracks.forEach(function (track) {
        track.events.forEach(function (event) {
            // you can now manipulate the event
            // (store a list of notes, make stats,
            //  show it on a score, ...)
        });
    });
});
```

And you can even create a whole tune right in your code!

```js
var midijs = require('midijs');
var fs = require('fs');

var tune = new midijs.File('sync tracks');
var spacer = 24;

tune.track()
    .meta('time signature')
    .meta('key signature')
    .meta('set tempo')
.end().track()
    .meta('sequence name', {
        text: 'Ode to Joy'
    })
    .channel('program change', {
        instrument: 'string ensemble 1'
    }, 0)

    // find the whole tune in the following files:
    // tests/fixtures/tune.js
    // tests/fixtures/tune.mid
.end();

fs.writeFile('Ode to Joy.mid', tune.encode(), function (err) {
    if (err) {
        throw err;
    }

    console.log('Saved!');
});
```

## More reading

### API docs

If you need more information about how to
use this module, go check out the
[wiki](https://github.com/matteodelabre/midijs/wiki),
a reference of all available functions and objects.

### License

The [module license (MIT)](LICENSE.md) describes
the conditions under which you are authorized
to distribute and edit this module's source code.

### Contribution guide

Help us make this module better by contributing
to its source! If you need a particular feature
or a bug to be fixed, the best way is to
propose changes. Find out more in the
[contribution guide](CONTRIBUTING.md).

### Change log

The [change log](CHANGELOG.md) lists all changes
that have been made to the public API, version per
version, so that you can easily upgrade and get
more features.
