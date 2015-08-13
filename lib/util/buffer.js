'use strict';

/**
 * @overview A set of methods for reading or writing buffers
 * with sequential reads, providing a moving cursor
 */

/**
 * Generic method for reading/writing 8-32 bits signed
 * or unsigned integers, big or little endian
 *
 * @param {Buffer} buf Buffer to use
 * @param {string} dir 'write' or 'read'
 * @param {string} signed 'U' if unsigned, empty otherwise
 * @param {string} endian 'BE' for big endian or 'LE' otherwise
 * @param {number} bytes Amount of bytes to read
 * @param {number} [value] Value to write, if dir = 'write'
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {number} Read integer if dir = 'read'
 */
function useInt(buf, dir, signed, endian, bytes, value, noinc) {
    var method = dir + signed + 'Int', result;

    if (bytes === 1) {
        method += '8';
    } else {
        method += (8 * bytes) + endian;
    }

    if (dir === 'read') {
        result = buf[method](buf.cursor);
    } else {
        result = buf[method](value, buf.cursor);
    }

    if (noinc === undefined || noinc) {
        buf.cursor += bytes;
    }

    return result;
}

/**
 * Initialize the cursor, must be used before using
 * any method in this module. If the buffer was already
 * initialized, just add a stacking level
 *
 * @param {Buffer} buf Buffer to use
 * @return {null}
 */
exports.start = function (buf) {
    if (buf.cursor === undefined) {
        buf.cursor = 0;
        buf.stack = 1;
    } else {
        buf.stack += 1;
    }
};

/**
 * Remove a stacking level, and remove the cursor if
 * the level has reached 0. Should be used when you
 * are done using this module's methods
 *
 * @param {Buffer} buf Used buffer
 * @return {null}
 */
exports.end = function (buf) {
    if (buf.stack === 1) {
        delete buf.cursor;
        delete buf.stack;
    } else if (buf.stack > 1) {
        buf.stack -= 1;
    }
};

/**
 * Seek the cursor to given position
 *
 * @param {Buffer} buf Used buffer
 * @param {number} pos New cursor position
 * @return {null}
 */
exports.seek = function (buf, pos) {
    buf.cursor = pos;
};

/**
 * Get the cursor position
 *
 * @param {Buffer} buf Used buffer
 * @return {number} Current cursor position
 */
exports.tell = function (buf) {
    return buf.cursor;
};

/**
 * Check whether the cursor is outside of the buffer
 *
 * @param {Buffer} buf Used buffer
 * @return {bool} Whether the cursor is outside of the buffer
 */
exports.eof = function (buf) {
    return buf.cursor >= buf.length;
};

/**
 * Write an unsigned integer at current cursor
 * position, little endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {number} value Value to write
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {null}
 */
exports.writeUIntLE = function (buf, bytes, value, noinc) {
    return useInt(buf, 'write', 'U', 'LE', bytes, value, noinc);
};

/**
 * Write an unsigned integer at current cursor
 * position, big endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {number} value Value to write
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {null}
 */
exports.writeUIntBE = function (buf, bytes, value, noinc) {
    return useInt(buf, 'write', 'U', 'BE', bytes, value, noinc);
};

/**
 * Write an integer at current cursor
 * position, little endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {number} value Value to write
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {null}
 */
exports.writeIntLE = function (buf, bytes, value, noinc) {
    return useInt(buf, 'write', '', 'LE', bytes, value, noinc);
};

/**
 * Write an integer at current cursor
 * position, big endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {number} value Value to write
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {null}
 */
exports.writeIntBE = function (buf, bytes, value, noinc) {
    return useInt(buf, 'write', '', 'BE', bytes, value, noinc);
};

/**
 * Write a string at current cursor position
 *
 * @param {Buffer} buf Used buffer
 * @param {string} str String to write
 * @param {string} encoding Encoding to use for the string
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {number} Number of written bytes
 */
exports.write = function (buf, str, encoding, noinc) {
    var result = buf.write(str, buf.cursor, Buffer.byteLength(str), encoding);

    if (noinc === undefined || noinc) {
        buf.cursor += result;
    }

    return result;
};

/**
 * Copy given buffer to first buffer at current
 * cursor position
 *
 * @param {Buffer} buf Buffer to copy to
 * @param {Buffer} src Buffer to copy from
 * @param {number} [start=0] Copied buffer slicing start
 * @param {number} [end=from.length] Copied buffer slicing end
 * @return {number} Number of written bytes
 */
exports.copy = function (buf, src, start, end, noinc) {
    var result = src.copy(buf, buf.cursor, start, end);

    if (noinc === undefined || noinc) {
        buf.cursor += result;
    }

    return result;
};

/**
 * Read an unsigned integer at current cursor
 * position, little endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {number} Read value
 */
exports.readUIntLE = function (buf, bytes, noinc) {
    return useInt(buf, 'read', 'U', 'LE', bytes, noinc);
};

/**
 * Read an unsigned integer at current cursor
 * position, big endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {number} Read value
 */
exports.readUIntBE = function (buf, bytes, noinc) {
    return useInt(buf, 'read', 'U', 'BE', bytes, noinc);
};

/**
 * Read an integer at current cursor
 * position, little endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {number} Read value
 */
exports.readIntLE = function (buf, bytes, noinc) {
    return useInt(buf, 'read', '', 'LE', bytes, noinc);
};

/**
 * Read an integer at current cursor
 * position, big endian
 *
 * @param {Buffer} buf Used buffer
 * @param {number} bytes Number of bytes to use
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {number} Read value
 */
exports.readIntBE = function (buf, bytes, noinc) {
    return useInt(buf, 'read', '', 'BE', bytes, noinc);
};

/**
 * Slice the buffer from current cursor position
 * to current cursor position + length (this slice
 * is not a copy but a reference)
 *
 * @param {Buffer} buf Used buffer
 * @param {number} [length=buf.length-buf.cursor] Slicing length
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 * @return {Buffer} Sliced buffer, without cursor
 */
exports.slice = function (buf, length, noinc) {
    var result, end;

    end = (length === undefined) ? undefined : buf.cursor + length;
    result = buf.slice(buf.cursor, end);

    if (noinc === undefined || noinc) {
        buf.cursor += result.length;
    }

    return result;
};

/**
 * Convert the buffer to a string, for given
 * length starting at current position
 *
 * @param {Buffer} buf Used buffer
 * @param {string} [encoding='utf8'] String encoding
 * @param {number} [length=buf.length-buf.cursor] String length
 * @param {bool} [noinc=false] Set to true to avoid incrementing the cursor
 */
exports.toString = function (buf, encoding, length, noinc) {
    var result, end;

    end = (length === undefined) ? undefined : buf.cursor + length;
    result = buf.toString(encoding, buf.cursor, end);

    if (noinc === undefined || noinc) {
        buf.cursor += Buffer.byteLength(result);
    }

    return result;
};
