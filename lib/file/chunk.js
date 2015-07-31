'use strict';

var buffer = require('../util/buffer');

/**
 * Decode a SMF chunk
 *
 * @param {Buffer} buf Buffer to use
 * @return {Object} Object with chunk type and chunk data
 */
exports.decode = function (buf) {
    var type, length, data;

    buffer.start(buf);
    type = buffer.toString(buf, 'ascii', 4);
    length = buffer.readUIntBE(buf, 4);
    data = buffer.slice(buf, length);
    buffer.end(buf);

    return {
        type: type,
        data: data
    };
};

/**
 * Encode a chunk to SMF bytes
 *
 * @param {string} type Chunk type
 * @param {Buffer} data Chunk data
 * @return {Buffer} Encoded chunk bytes
 */
exports.encode = function (type, data) {
    var buf = new Buffer(
        Buffer.byteLength(type) + 4 + data.length
    );

    buffer.start(buf);
    buffer.write(buf, type, 'ascii');
    buffer.writeUIntBE(buf, 4, data.length);
    buffer.copy(buf, data);
    buffer.end(buf);

    return buf;
};
