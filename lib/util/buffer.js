'use strict';

/**
 * Generic method for reading/writing 8-32 bits signed
 * or unsigned integers, big or little endian in a Buffer
 *
 * @param {Buffer} buf Buffer to use
 * @param {string} dir 'write' or 'read'
 * @param {string} signed 'U' if unsigned, empty otherwise
 * @param {string} endian 'BE' for big endian or 'LE' otherwise
 * @param {number} bits Amount of bits to read
 * @param {number} [value] Value to write, if dir = 'write'
 * @throws {Error} If the cursor position or amount of bits are invalid
 * @return {number} Read integer if dir = 'read'
 */
function useInt(buf, dir, signed, endian, bits, value) {
    var method = dir + signed + 'Int', result;

    if (bits === 8) {
        method += '8';
    } else if (bits === 16 || bits === 32) {
        method += bits + endian;
    } else {
        throw new Error(
            'Invalid amount of bits: ' + bits + '\n' +
            'Should be 8, 16 or 32 bits'
        );
    }

    if (dir === 'read') {
        result = buf[method](buf.cursor);
    } else {
        result = buf[method](value, buf.cursor);
    }

    return result;
}

function MIDIBuffer(input) {
    if (input instanceof Buffer) {
        this.buffer = input;
    } else {
        this.buffer = new Buffer(input);
    }

    this.cursor = 0;
}

/**
 * Get the byte-length of the number as a variable integer
 *
 * @static
 * @param {number} value Number to encode
 * @return {number} Byte-length of the variable integer
 */
MIDIBuffer.getVarIntLength = function (value) {
    var length = 0;

    do {
        length += 1;
        value >>= 7;
    } while (value > 0);

    return length;
};

/**
 * Convert this MIDIBuffer to a regular buffer
 *
 * @return {Buffer} Converted buffer
 */
MIDIBuffer.prototype.toBuffer = function () {
    return this.buffer;
};

/**
 * Convert this MIDIBuffer to an Array
 *
 * @return {Array} An array with each byte
 */
MIDIBuffer.prototype.toArray = function () {
    return [].slice.call(this.buffer);
};

/**
 * Convert this MIDIBuffer to a Uint8Array
 *
 * @return {Uint8Array} Converted Uint8Array
 */
MIDIBuffer.prototype.toUint8Array = function () {
    return new Uint8Array(this.buffer);
};

/**
 * Seek the cursor to given position
 *
 * @param {number} pos New cursor position
 * @throws {RangeError} If the position is invalid
 * @return {null}
 */
MIDIBuffer.prototype.seek = function (pos) {
    if (pos < 0 || pos >= this.buffer.length) {
        throw new RangeError('Trying to seek beyond limits');
    }

    this.cursor = pos;
};

/**
 * Get the cursor position
 *
 * @return {number} Current cursor position
 */
MIDIBuffer.prototype.tell = function () {
    return this.cursor;
};

/**
 * Check whether the cursor is outside of the buffer
 *
 * @return {bool} Whether the cursor is outside of the buffer
 */
MIDIBuffer.prototype.eof = function () {
    return this.cursor >= this.buffer.length;
};

/**
 * Get the buffer's length
 *
 * @return {number} The buffer's length in bytes
 */
MIDIBuffer.prototype.getLength = function () {
    return this.buffer.length;
};

/**
 * Write an unsigned integer at current cursor
 * position, little endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {null}
 */
MIDIBuffer.prototype.writeUIntLE = function (bits, value) {
    useInt(this.buffer, 'write', 'U', 'LE', bits, value);
    this.cursor += bits / 8;
};

/**
 * Write an unsigned integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {null}
 */
MIDIBuffer.prototype.writeUIntBE = function (bits, value) {
    useInt(this.buffer, 'write', 'U', 'BE', bits, value);
    this.cursor += bits / 8;
};

/**
 * Write an integer at current cursor
 * position, little endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {null}
 */
MIDIBuffer.prototype.writeIntLE = function (bits, value) {
    useInt(this.buffer, 'write', '', 'LE', bits, value);
    this.cursor += bits / 8;
};

/**
 * Write an integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {null}
 */
MIDIBuffer.prototype.writeIntBE = function (bits, value) {
    useInt(this.buffer, 'write', '', 'BE', bits, value);
    this.cursor += bits / 8;
};

/**
 * Write a value as a variable integer in the buffer,
 * an integer that will span 1 to 4 bytes depending on
 * its value, as defined by the MIDI specification
 *
 * @param {number} value Value to write
 * @return {null}
 */
MIDIBuffer.prototype.writeVarInt = function (value) {
    var bytes = [], length, i;

    do {
        bytes.push(value & 0x7F);
        value >>= 7;
    } while (value > 0);

    length = bytes.length;

    for (i = length - 1; i >= 0; i -= 1) {
        if (i > 0) {
            bytes[i] |= 0x80;
        }

        this.writeUIntLE(8, bytes[i]);
    }
};

/**
 * Write a string at current cursor position
 *
 * @param {string} string String to write
 * @param {string} encoding Encoding to use for the string
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.write = function (string, encoding) {
    var result = this.buffer.write(
        string, this.cursor,
        Buffer.byteLength(string),
        encoding
    );

    this.cursor += result;
    return result;
};

/**
 * Copy given buffer to first buffer at current
 * cursor position
 *
 * @param {MIDIBuffer|Buffer} src Buffer to copy from
 * @param {number} [start=0] Copied buffer slicing start
 * @param {number} [end=from.length] Copied buffer slicing end
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.copy = function (src, start, end) {
    var result;

    if (src instanceof MIDIBuffer) {
        src = src.toBuffer();
    }

    result = src.copy(this.buffer, this.cursor, start, end);
    this.cursor += result;

    return result;
};

/**
 * Read an unsigned integer at current cursor
 * position, little endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readUIntLE = function (bits) {
    var result = useInt(this.buffer, 'read', 'U', 'LE', bits);

    this.cursor += bits / 8;
    return result;
};

/**
 * Read an unsigned integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readUIntBE = function (bits) {
    var result = useInt(this.buffer, 'read', 'U', 'BE', bits);

    this.cursor += bits / 8;
    return result;
};

/**
 * Read an integer at current cursor
 * position, little endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readIntLE = function (bits) {
    var result = useInt(this.buffer, 'read', '', 'LE', bits);

    this.cursor += bits / 8;
    return result;
};

/**
 * Read an integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readIntBE = function (bits) {
    var result = useInt(this.buffer, 'read', '', 'BE', bits);

    this.cursor += bits / 8;
    return result;
};

/**
 * Read a variable integer, a integer that can span
 * from 1 to 4 bytes depending on its size, as defined
 * by the MIDI specification
 *
 * @return {number} Read value
 */
MIDIBuffer.prototype.readVarInt = function () {
    var value = 0, byte;

    do {
        byte = this.readUIntLE(8);

        value <<= 7;
        value |= byte & 0x7F;
    } while (byte & 0x80);

    return value;
};

/**
 * Slice the buffer from current cursor position
 * to current cursor position + length (this slice
 * is not a copy but a reference)
 *
 * @param {number} [length=buf.length-buf.cursor] Slicing length
 * @return {MIDIBuffer} Sliced MIDI buffer
 */
MIDIBuffer.prototype.slice = function (length) {
    var result = new MIDIBuffer(this.buffer.slice(
        this.cursor,
        (length === undefined) ? undefined : this.cursor + length
    ));

    this.cursor += length;
    return result;
};

/**
 * Convert the buffer to a string, for given
 * length starting at current position
 *
 * @param {string} [encoding='utf8'] String encoding
 * @param {number} [length=buf.length-buf.cursor] String length
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 */
MIDIBuffer.prototype.toString = function (encoding, length) {
    var result = this.buffer.toString(
        encoding, this.cursor,
        (length === undefined) ? undefined : this.cursor + length
    );

    this.cursor += length;
    return result;
};
