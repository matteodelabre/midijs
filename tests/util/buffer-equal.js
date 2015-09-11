'use strict';

/**
 * Format a byte to hexadecimal
 *
 * @param {number} byte Value of the byte
 * @return {string} Hex value of that byte
 */
function formatByte(byte) {
    return '0x' + byte.toString(16);
}

/**
 * Assert that two buffer equal each other
 *
 * @param {Object} test Tape testing object
 * @param {Object|Buffer|Array} input1 First buffer
 * @param {Object|Buffer|Array} input2 Second buffer
 * @param {string} msg Description for this assertion
 * @param {Object} extra Extra data
 */
module.exports = function bufferEqual(test, input1, input2, msg, extra) {
    var buffer1, buffer2, equals = true,
        length, i, expected, actual;

    // convert inputs to buffers
    buffer1 = (input1 instanceof Buffer) ? input1 : new Buffer(input1);
    buffer2 = (input2 instanceof Buffer) ? input2 : new Buffer(input2);

    length = Math.max(buffer1.length, buffer2.length);

    for (i = 0; i < length; i += 1) {
        if (buffer1[i] !== buffer2[i]) {
            equals = false;
        }
    }

    // build diffing strings if the buffers differ
    if (!equals) {
        buffer1 = [].slice.call(buffer1);
        buffer2 = [].slice.call(buffer2);

        expected = '<Buffer (' + buffer1.length + ') ' +
            buffer1.map(formatByte).join(' ') + '>';

        actual = '<Buffer (' + buffer2.length + ') ' +
            buffer2.map(formatByte).join(' ') + '>';
    }

    test._assert(equals, {
        message: (msg === undefined) ? 'should be equal' : msg,
        operator: 'equal',
        expected: expected,
        actual: actual,
        extra: extra
    });
};
