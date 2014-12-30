/*jshint node:true, browser:true */

'use strict';

/**
 * Sequentially read binary structures in a string
 *
 * @param {data: string}    Original data
 */
function Stream(data) {
    var converted, length, i;
    
    // ensure we only have ASCII chars
    converted = [];
    length = data.length;

    for (i = 0; i < length; i += 1) {
        converted[i] = String.fromCharCode(
            data.charCodeAt(i) & 255
        );
    }
    
    this.position = 0;
    this.data = converted.join("");
}

/**
 * Move reading position relative to current
 *
 * @param {delta: int}  Relative position (in bytes)
 */
Stream.prototype.move = function (delta) {
    this.position += delta;
};

/**
 * Read a string of arbitrary length
 *
 * @param {length: int} String length
 * @return string
 */
Stream.prototype.readString = function (length) {
    var position = this.position;
    this.position += length;
    
    return this.data.substr(position, length);
};

/**
 * Read an integer of 8, 16 or 32 bits
 *
 * @param {type: int}       Integer length (8, 16 or 32)
 * @param {signed: bool}    Whether the integer is signed or not
 *                          (defaults to false)
 * @return int
 */
Stream.prototype.readInt = function (type, signed) {
    if ([8, 16, 32].indexOf(type) === -1) {
        throw new Error('Unknown integer type');
    }
    
    var data = this.readString(type / 8), i, j,
        length = data.length,
        result = -Math.pow(2, type) * !!signed;
    
    for (i = 0, j = length - 1; i < length; i += 1, j -= 1) {
        result += (data.charCodeAt(i) << (j * 8));
    }
    
    return result;
};

/**
 * Read a variable-length integer
 * (up to 4 bytes in big-endian order, if
 * the MSB is set, it means another byte is following).
 *
 * @return int
 */
Stream.prototype.readVarInt = function () {
    var result = 0, length = 0, byte;
    
    do {
        byte = this.readInt(8);
        
        result <<= 7;
        result += byte;
        length += 1;
    } while (byte & 0x80 && length < 4);
        
    return result;
};

module.exports = Stream;