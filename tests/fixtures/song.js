'use strict';

var File = require('../../').File;
var fs = require('fs');
var path = require('path');

var tune = new File('sync tracks');
var spacer = 120;

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
    }, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer)
    .channel('note on', {
        note: 'G'
    }, 0)
    .channel('note off', {
        note: 'G'
    }, 0, spacer)
    .channel('note on', {
        note: 'G'
    }, 0)
    .channel('note off', {
        note: 'G'
    }, 0, spacer)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0, spacer / 2)
    .channel('note off', {
        note: 'D'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)

    .meta('marker', {
        text: 'Verse 2'
    }, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer)
    .channel('note on', {
        note: 'G'
    }, 0)
    .channel('note off', {
        note: 'G'
    }, 0, spacer)
    .channel('note on', {
        note: 'G'
    }, 0)
    .channel('note off', {
        note: 'G'
    }, 0, spacer)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0, spacer / 2)
    .channel('note off', {
        note: 'C'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)

    .meta('marker', {
        text: 'Verse 3'
    }, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)

    .meta('marker', {
        text: 'Verse 4'
    }, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer)
    .channel('note on', {
        note: 'G'
    }, 0)
    .channel('note off', {
        note: 'G'
    }, 0, spacer)
    .channel('note on', {
        note: 'G'
    }, 0)
    .channel('note off', {
        note: 'G'
    }, 0, spacer)
    .channel('note on', {
        note: 'F'
    }, 0)
    .channel('note off', {
        note: 'F'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'E'
    }, 0)
    .channel('note off', {
        note: 'E'
    }, 0, spacer)
    .channel('note on', {
        note: 'D'
    }, 0)
    .channel('note off', {
        note: 'D'
    }, 0, spacer)
    .channel('note on', {
        note: 'C'
    }, 0, spacer / 2)
    .channel('note off', {
        note: 'C'
    }, 0, spacer / 2)
    .channel('note on', {
        note: 'C'
    }, 0)
    .channel('note off', {
        note: 'C'
    }, 0, spacer * 2)
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
    }, spacer)
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 4)
    .channel('note off', {
        note: 'G3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 4)
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'E3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 4)
    .channel('note off', {
        note: 'E3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 4)

    .meta('marker', {
        text: 'Verse 2'
    })
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 4)
    .channel('note off', {
        note: 'G3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 4)
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'E3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 4)
    .channel('note off', {
        note: 'E3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'E3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 2)
    .channel('note off', {
        note: 'E3'
    }, 1)

    .meta('marker', {
        text: 'Verse 3'
    })
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'G3#'
    }, 1)
    .channel('note off', {
        note: 'G3#'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'A3'
    }, 1)
    .channel('note off', {
        note: 'A3'
    }, 1, spacer)
    .channel('note on', {
        note: 'G3B'
    }, 1)
    .channel('note off', {
        note: 'G3B'
    }, 1, spacer)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer)

    .meta('marker', {
        text: 'Verse 4'
    })
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 4)
    .channel('note off', {
        note: 'G3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 4)
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'E3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 4)
    .channel('note off', {
        note: 'E3'
    }, 1)
    .channel('note on', {
        note: 'G3'
    }, 1)
    .channel('note off', {
        note: 'G3'
    }, 1, spacer * 2)
    .channel('note on', {
        note: 'C3'
    }, 1)
    .channel('note on', {
        note: 'E3'
    }, 1)
    .channel('note off', {
        note: 'C3'
    }, 1, spacer * 2)
    .channel('note off', {
        note: 'E3'
    }, 1)
.end();

fs.writeFile(path.join(__dirname, 'song.mid'), tune.encode(), function (err) {
    if (err) {
        throw err;
    }
    console.log('Beethoven saved.');
});
