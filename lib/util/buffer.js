'use strict';

/**
 * Generic method for reading/writing 8-32 bits signed
 * or unsigned integers, big or little endian in a Buffer
 *
 * @param {MIDIBuffer} data Buffer to use
 * @param {string} dir 'write' or 'read'
 * @param {string} signed 'U' if unsigned, empty otherwise
 * @param {string} endian 'BE' for big endian or 'LE' otherwise
 * @param {number} bits Amount of bits to read
 * @param {number} [value] Value to write, if dir = 'write'
 * @throws {Error} If the cursor position or amount of bits are invalid
 * @return {number} Read integer if dir = 'read'
 */
function useInt(data, dir, signed, endian, bits, value) {
    var method = dir + signed + 'Int', result,
        buf = data.toBuffer(), cursor = data.tell();

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
        result = buf[method](cursor);
    } else {
        result = buf[method](value, cursor);
    }

    data.seek(cursor + bits / 8);
    return result;
}

/**
 * @class MIDIBuffer
 * @classdesc An enhanced Buffer with a reading/writing cursor and
 * MIDI-specific writing and reading functions
 *
 * @param {*} input Any input accepted by Buffer's constructor
 */
function MIDIBuffer(input) {
    if (input instanceof MIDIBuffer) {
        this.parent = input;
        this.buffer = input.buffer;
        this.cursor = input.cursor;
    } else {
        if (input instanceof Buffer) {
            this.buffer = input;
        } else {
            this.buffer = new Buffer(input);
        }

        this.cursor = 0;
    }
}

module.exports = MIDIBuffer;

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
 * Concat a list of buffers
 *
 * @static
 * @param {Array<MIDIBuffer|Buffer|Array|*>} list Buffers to merge
 * @return {MIDIBuffer} Merged buffer
 */
MIDIBuffer.concat = function (list) {
    return new MIDIBuffer(Buffer.concat(list.map(function (buffer) {
        if (buffer instanceof MIDIBuffer) {
            return buffer.buffer;
        } else if (buffer instanceof Buffer) {
            return buffer;
        }

        return new Buffer(buffer);
    })));
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
    if (pos < 0 || pos > this.buffer.length) {
        throw new RangeError('Trying to seek beyond limits');
    }

    // update parent buffer's cursor
    if (this.parent) {
        this.parent.seek(pos);
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
    return this.tell() >= this.buffer.length;
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
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.writeUIntLE = function (bits, value) {
    useInt(this, 'write', 'U', 'LE', bits, value);
    return bits / 8;
};

/**
 * Write an unsigned integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.writeUIntBE = function (bits, value) {
    useInt(this, 'write', 'U', 'BE', bits, value);
    return bits / 8;
};

/**
 * Write an integer at current cursor
 * position, little endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.writeIntLE = function (bits, value) {
    useInt(this, 'write', '', 'LE', bits, value);
    return bits / 8;
};

/**
 * Write an integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to write (8, 16, 32)
 * @param {number} value Value to write
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.writeIntBE = function (bits, value) {
    useInt(this, 'write', '', 'BE', bits, value);
    return bits / 8;
};

/**
 * Write a value as a variable integer in the buffer,
 * an integer that will span 1 to 4 bytes depending on
 * its value, as defined by the MIDI specification
 *
 * @param {number} value Value to write
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.writeVarInt = function (value) {
    var bytes = [], total = 0, length, i;

    do {
        bytes.push(value & 0x7F);
        value >>= 7;
    } while (value > 0);

    length = bytes.length;

    for (i = length - 1; i >= 0; i -= 1) {
        if (i > 0) {
            bytes[i] |= 0x80;
        }

        total += this.writeUIntLE(8, bytes[i]);
    }

    return total;
};

/**
 * Write a MIDI chunk of data in this buffer
 *
 * @param {string} type Type of chunk (unique ASCII ID)
 * @param {MIDIBuffer|Buffer|Array|*} data Data to write
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.writeChunk = function (type, data) {
    var total;

    total = this.write(type, 'ascii');
    total += this.writeUIntBE(32, new MIDIBuffer(data).getLength());
    total += this.copy(data);

    return total;
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
        string, this.tell(),
        Buffer.byteLength(string),
        encoding
    );

    this.seek(this.tell() + result);
    return result;
};

/**
 * Copy given buffer to first buffer at current
 * cursor position
 *
 * @param {MIDIBuffer|Buffer|Array|*} src Data to be copied
 * @param {number} [start=0] Copy starting byte
 * @param {number} [end=from.length] Copy ending byte
 * @return {number} Number of written bytes
 */
MIDIBuffer.prototype.copy = function (src, start, end) {
    var result;

    if (src instanceof MIDIBuffer) {
        src = src.buffer;
    } else if (!(src instanceof Buffer)) {
        src = new Buffer(src);
    }

    result = src.copy(this.buffer, this.tell(), start, end);
    this.seek(this.tell() + result);

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
    return useInt(this, 'read', 'U', 'LE', bits);
};

/**
 * Read an unsigned integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readUIntBE = function (bits) {
    return useInt(this, 'read', 'U', 'BE', bits);
};

/**
 * Read an integer at current cursor
 * position, little endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readIntLE = function (bits) {
    return useInt(this, 'read', '', 'LE', bits);
};

/**
 * Read an integer at current cursor
 * position, big endian
 *
 * @param {number} bits Number of bits to read (8, 16, 32)
 * @return {number} Read value
 */
MIDIBuffer.prototype.readIntBE = function (bits) {
    return useInt(this, 'read', '', 'BE', bits);
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
 * Write a MIDI chunk of data in this buffer
 *
 * @return {Object} Object with chunk type and data
 */
MIDIBuffer.prototype.readChunk = function () {
    var type, length, data;

    type = this.toString('ascii', 4);
    length = this.readUIntBE(32);
    data = this.slice(length);

    return {
        type: type,
        data: data
    };
};

/**
 * Slice the buffer from current cursor position
 * to current cursor position + length (this slice
 * is not a copy but a reference)
 *
 * @param {number} [length=buf.getLength()-buf.tell()] Slicing length
 * @return {MIDIBuffer} Sliced MIDI buffer
 */
MIDIBuffer.prototype.slice = function (length) {
    var result = new MIDIBuffer(this.buffer.slice(
        this.tell(),
        (length === undefined) ? undefined : this.tell() + length
    ));

    this.seek(this.tell() + length);
    return result;
};

/**
 * Convert the buffer to a string, for given
 * length starting at current position
 *
 * @param {string} [encoding='utf8'] String encoding
 * @param {number} [length=buf.getLength()-buf.tell()] String length
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 */
MIDIBuffer.prototype.toString = function (encoding, length) {
    var result = this.buffer.toString(
        encoding, this.tell(),
        (length === undefined) ? undefined : this.tell() + length
    );

    this.seek(this.tell() + length);
    return result;
};
