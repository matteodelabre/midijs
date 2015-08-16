'use strict';

var File = require('../../').File;
var fs = require('fs');
var path = require('path');

var beat = 120;
var tune = new File('sync tracks', [], beat);

tune.track()
    .meta('time signature')
    .meta('key signature')
    .meta('set tempo')
.end().track()
    .meta('sequence name', {
        text: 'Right hand'
    })
    .channel('program change', {
        instrument: 'bright acoustic piano'
    }, 0)

    .meta('marker', {
        text: 'Verse 1'
    }, beat)
    .note('E', beat, 0)
    .note('E', beat, 0)
    .note('F', beat, 0)
    .note('G', beat, 0)
    .note('G', beat, 0)
    .note('F', beat, 0)
    .note('E', beat, 0)
    .note('D', beat, 0)
    .note('C', beat, 0)
    .note('C', beat, 0)
    .note('D', beat, 0)
    .note('E', beat, 0)
    .note('E', beat, 0)
    .note('D', beat / 2, 0, beat / 2)
    .note('D', beat, 0)

    .meta('marker', {
        text: 'Verse 2'
    }, beat)
    .note('E', beat, 0)
    .note('E', beat, 0)
    .note('F', beat, 0)
    .note('G', beat, 0)
    .note('G', beat, 0)
    .note('F', beat, 0)
    .note('E', beat, 0)
    .note('D', beat, 0)
    .note('C', beat, 0)
    .note('C', beat, 0)
    .note('D', beat, 0)
    .note('E', beat, 0)
    .note('D', beat, 0)
    .note('C', beat / 2, 0, beat / 2)
    .note('C', beat, 0)

    .meta('marker', {
        text: 'Verse 3'
    }, beat)
    .note('D', beat, 0)
    .note('D', beat, 0)
    .note('E', beat, 0)
    .note('C', beat, 0)
    .note('D', beat, 0)
    .note('E', beat / 2, 0)
    .note('F', beat / 2, 0)
    .note('E', beat, 0)
    .note('C', beat, 0)
    .note('D', beat, 0)
    .note('E', beat / 2, 0)
    .note('F', beat / 2, 0)
    .note('E', beat, 0)
    .note('D', beat, 0)
    .note('C', beat, 0)
    .note('D', beat, 0)

    .meta('marker', {
        text: 'Verse 4'
    }, beat)
    .note('E', beat, 0)
    .note('E', beat, 0)
    .note('F', beat, 0)
    .note('G', beat, 0)
    .note('G', beat, 0)
    .note('F', beat, 0)
    .note('E', beat, 0)
    .note('D', beat, 0)
    .note('C', beat, 0)
    .note('C', beat, 0)
    .note('D', beat, 0)
    .note('E', beat, 0)
    .note('D', beat, 0)
    .note('C', beat / 2, 0, beat / 2)
    .note('C', beat * 2, 0)
.end().track()
    .meta('sequence name', {
        text: 'Left hand'
    })
    .channel('program change', {
        instrument: 'acoustic grand piano'
    }, 1)
    .channel('controller', {
        type: 'channel volume msb',
        value: 63
    }, 1)

    .meta('marker', {
        text: 'Verse 1'
    }, beat)
    .note('C3+G3', beat * 4, 1)
    .note('G3', beat * 4, 1)
    .note('C3+E3', beat * 4, 1)
    .note('G3', beat * 4, 1)

    .meta('marker', {
        text: 'Verse 2'
    })
    .note('C3+G3', beat * 4, 1)
    .note('G3', beat * 4, 1)
    .note('C3+E3', beat * 4, 1)
    .note('G3', beat * 2, 1)
    .note('C3+E3', beat * 2, 1)

    .meta('marker', {
        text: 'Verse 3'
    })
    .note('G3', beat * 2, 1)
    .note('G3', beat * 2, 1)
    .note('G3', beat * 2, 1)
    .note('G3', beat * 2, 1)
    .note('G3', beat * 2, 1)
    .note('G3#', beat * 2, 1)
    .note('A3', beat, 1)
    .note('G3B', beat, 1)
    .note('G3', beat, 1)

    .meta('marker', {
        text: 'Verse 4'
    })
    .note('C3+G3', beat * 4, 1)
    .note('G3', beat * 4, 1)
    .note('C3+E3', beat * 4, 1)
    .note('G3', beat * 2, 1)
    .note('C3+E3', beat * 2, 1)
.end();

fs.writeFile(path.join(__dirname, 'song.mid'), tune.encode(), function (err) {
    if (err) {
        throw err;
    }
    console.log('Beethoven saved.');
});
