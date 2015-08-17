'use strict';

/**
 * @overview Test set for MIDI events
 */

var test = require('tape');

var events = require('../').events;
var MalformedError = require('../lib/util/errors').MalformedError;

/**
 * Check whether two buffers contain the same data or not
 *
 * @param {Buffer} a First buffer
 * @param {Buffer} b Second buffer
 * @return {bool} Whether the two buffers equal or not
 */
function bufferEqual(a, b) {
    var length = a.length, i;

    if (length !== b.length) {
        return false;
    }

    for (i = 0; i < length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Test given type of event for integrity
 *
 * @param {Object} assert Assertion object
 * @param {function} Ctor Event constructor
 * @return {null}
 */
function testType(assert, Ctor) {
    var types = Ctor.TYPE, name, evt, bytes, parsed;

    for (name in types) {
        if (types.hasOwnProperty(name)) {
            evt = new Ctor(name);
            bytes = evt.encode();

            assert.ok(bytes instanceof Buffer, 'should encode to buffer');

            parsed = events.Event.decode(bytes);
            assert.equal(parsed.type, evt.type, Ctor.name + ' should keep types');

            if (!(parsed.data instanceof Buffer)) {
                assert.deepEqual(parsed.data, evt.data, Ctor.name + ' should keep defaults');
            } else {
                assert.ok(bufferEqual(parsed.data, evt.data), Ctor.name + ' should keep bytes');
            }

            if (Ctor.name === 'ChannelEvent') {
                assert.equal(parsed.channel, evt.channel, 'ChannelEvent should keep channel');
            }
        }
    }

    assert.end();
}

test('events', function (sub) {
    sub.test('event decoding', function (assert) {
        assert.throws(function () {
            events.Event.decode(new Buffer([0x51]), null, 5);
        }, MalformedError, 'should throw with invalid events');

        assert.throws(function () {
            events.Event.decode(new Buffer([0x51]), {}, 5);
        }, MalformedError, 'should throw with invalid running status');

        assert.end();
    });

    sub.test('channel events', function (assert) {
        testType(assert, events.ChannelEvent);
    });

    sub.test('sysex events', function (assert) {
        testType(assert, events.SysexEvent);
    });

    sub.test('meta events', function (assert) {
        testType(assert, events.MetaEvent);
    });
});
