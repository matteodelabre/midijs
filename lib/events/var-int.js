'use strict';

var buffer = require('../buffer');

/**
 * Construct a VarInt
 *
 * @class VarInt
 * @classdesc Used to encode or decode binary variable integers
 * as defined by the MIDI specification
 *
 * @param {number} value Decoded value
 */
function VarInt(value) {
    this.value = parseInt(value, 10);
}

module.exports = VarInt;

/**
 * Decode given encoded variable integer
 *
 * @static
 * @param {Buffer} buf Bytes to decode
 * @return {VarInt} Decoded VarInt
 */
VarInt.decode = function (buf) {
    var value = 0, byte;

    buffer.start(buf);

    do {
        byte = buffer.readUIntLE(buf, 1);

        value <<= 7;
        value |= byte & 0x7F;
    } while (byte & 0x80);

    buffer.end(buf);
    return new VarInt(value);
};

/**
 * Encode current value to a variable integer
 *
 * @return {Buffer} Buffer of variable integer's bytes
 */
VarInt.prototype.encode = function () {
    var buf, bytes = [], length, i,
        value = parseInt(this.value, 10);

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
