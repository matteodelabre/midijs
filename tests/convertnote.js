'use strict';

/**
 * Test suite for lib utilities
 */

const test = require('tape');
const convertNote = require('../lib/util/convertnote');

test('Converting English-notated notes with convertNote', assert => {
    assert.equal(convertNote('C4'), convertNote('C'), 'should default octave to 4');
    assert.equal(convertNote('C4#'), convertNote('C4') + 1, 'should parse sharps');
    assert.equal(convertNote('C4B'), convertNote('C4') - 1, 'should parse flats');
    assert.equal(convertNote('C4♯'), convertNote('C4#'), 'should allow alternative notation');
    assert.equal(convertNote('C4B'), convertNote('C4♭'), 'should allow alternative notation');
    assert.equal(convertNote('C-1'), 0, 'should start at 0');
    assert.equal(convertNote('C4'), 60, 'should have middle at 64');
    assert.equal(convertNote('C8'), 108, 'should end at 108');
    assert.end();
});
