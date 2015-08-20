'use strict';

/**
 * @overview Decoder and encoder for variable integers
 * defined by this MIDI specification
 */

var buffer = require('../util/buffer');

/**
 * Decode given encoded variable integer
 *
 * @param {Buffer} buf Bytes to decode
 * @return {number} Decoded number
 */
exports.decode = function (buf) {
    var value = 0, byte;

    buffer.start(buf);

    do {
        byte = buffer.readUIntLE(buf, 1);

        value <<= 7;
        value |= byte & 0x7F;
    } while (byte & 0x80);

    buffer.end(buf);
    return value;
};

/**
 * Encode given value to a variable integer
 *
 * @param {number} value Value to encode
 * @return {Buffer} Buffer of variable integer's bytes
 */
exports.encode = function (value) {
    var buf, bytes = [], length, i;

    do {
        bytes.push(value & 0x7F);
        value >>= 7;
    } while (value > 0);

    length = bytes.length;
    buf = new Buffer(length);
    buffer.start(buf);

    for (i = length - 1; i >= 0; i -= 1) {
        if (i > 0) {
            bytes[i] |= 0x80;
        }

        buffer.writeUIntLE(buf, 1, bytes[i]);
    }

    buffer.end(buf);
    return buf;
};
