# midijs

Parser and encoder for MIDI events and Standard MIDI files.

[![npm version](https://img.shields.io/npm/v/midijs.svg?style=flat-square)](https://www.npmjs.com/package/midijs)
[![npm downloads](https://img.shields.io/npm/dm/midijs.svg?style=flat-square)](https://www.npmjs.com/package/midijs)
[![build status](https://img.shields.io/travis/MattouFP/midijs.svg?style=flat-square)](https://travis-ci.org/MattouFP/midijs)
[![coverage](https://img.shields.io/coveralls/MattouFP/midijs.svg?style=flat-square)](https://coveralls.io/github/MattouFP/midijs)
[![dependencies status](http://img.shields.io/david/mattoufp/midijs.svg?style=flat-square)](https://david-dm.org/MattouFP/midijs)

## Quick start

Using this module, you can easily work with
MIDI events and Standard MIDI files. It exposes
a easily-readable, high-level API for manipulating
MIDI data, and even creating MIDI files
_right from your code!_

**NOTE:** this module does not provide access to the devices by itself,
but enables you to handle the stream of events that are sent
to or received from them. Use this module with the
[WebMIDI API](http://www.w3.org/TR/webmidi/) in the browser,
or [`node-midi`](http://npmjs.com/package/midi) with Node.JS for this purpose.

### Install

This is a module for JavaScript. Start using it with npm.

```sh
npm install --save midijs
```

### Examples

Here are a few common things that you can do with the help of this module.  
Send an event to a device, without writing raw MIDI data!

```js
var ChannelEvent = require('midijs').events.ChannelEvent;

// using the WebMIDI API or `node-midi`
output.send(new ChannelEvent('controller', { // or #sendMessage with node
    type: 'all sound off',
    value: 127
}).encode());
```

Or receive them from the device and read them as easily.

```js
var Event = require('midijs').events.Event;
var rs = {}; // ensure we use the running status if requested

// using the WebMIDI API
input.onmidimessage = function (event) {
    var decoded = Event.decode(new Buffer(event.data), rs, event.timestamp);
    // `decoded` is a decoded representation of `event`
};

// using `node-midi`
input.on('event', function (timestamp, data) {
    var decoded = Event.decode(new Buffer(data), rs, timestamp);
    // `decoded` is a decoded representation of `event`
});
```

Read a Standard MIDI File's tracks and events.

```js
var File = require('midijs').File;
var ChannelEvent = require('midijs').events.ChannelEvent;
var fs = require('fs');

fs.readFile('Ode to Joy.mid', function (err, data) {
    var tune;

    if (err) {
        throw err;
    }

    tune = File.decode(data);
    tune.tracks.forEach(function (track) {
        track.events.forEach(function (event) {
            if (event instanceof ChannelEvent) {
                // this is a channel event, use it
            }
        });
    });
});
```

Or create a whole tune right from your code!

```js
var File = require('midijs').File;
var fs = require('fs');
var tune = new File('sync tracks');
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

    console.log('Beethoven saved.');
});
```

## More reading

### API docs

If you need more information about how to
use this module, head over to the
[API docs](http://matteodelabre.me/midijs),
a precise reference of all available
public functions and classes.

### License

The [module license (MIT)](LICENSE.md) describes
the conditions under which you are authorized
to distribute and edit this module's source code.

### Contribution guide

Help us make this module better by contributing
to its source! If you need a particular feature
or a bug to be fixed, the best way is to
propose changes. Find more in the
[contribution guide](CONTRIBUTING.md).

### Changelog

The [changelog](CHANGELOG.md) lists all changes
that have been made to the public API, version per
version, so that you can easily upgrade and get
more features!
