'use strict';

var MIDIBuffer = require('../../lib/util/buffer');

/**
 * Check whether two buffers contain the same data or not
 *
 * @param {MIDIBuffer|Buffer|Array|*} ina First buffer
 * @param {MIDIBuffer|Buffer|Array|*} inb Second buffer
 * @return {bool} Whether the two buffers equal or not
 */
module.exports = function bufferEqual(ina, inb) {
    var a = new MIDIBuffer(ina).toBuffer(),
        b = new MIDIBuffer(inb).toBuffer(),
        length = a.length, i;

    if (length !== b.length) {
        return false;
    }

    for (i = 0; i < length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};
