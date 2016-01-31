'use strict';

const stampit = require('stampit');

// list of DataView methods, without get/set prefixes
const dataViewMethods = [
    'Int8', 'Uint8', 'Int16', 'Uint16',
    'Int32', 'Uint32', 'Float32', 'Float64'
];

/**
 * SeekerView stamp
 *
 * A view to an ArrayBuffer that provides an internal cursor, moving
 * with each reading and writing
 *
 * @param {Object} args List of arguments
 * @param {ArrayBuffer} args.buffer Buffer to point to
 * @param {number} [args.byteOffset=0] View's starting point relative to the buffer
 * @param {number} [args.byteLength=buffer.byteLength] View length
 */
const SeekerView = stampit().init(ctx => {
    const instance = ctx.instance;
    const dataview = new DataView(
        instance.buffer, instance.byteOffset, instance.byteLength
    );

    let cursor = 0;

    // create proxy methods to the dataview
    // see the DataView documentation for more information
    // extra methods like getUint8Array are defined with intuitive specs
    dataViewMethods.forEach(method => {
        const ArrayCtor = global[method + 'Array'];
        const consumed = ArrayCtor.BYTES_PER_ELEMENT;

        instance['get' + method] = littleEndian => {
            const pos = cursor;
            cursor += consumed;
            return dataview['get' + method](pos, littleEndian);
        };

        instance['set' + method] = (value, littleEndian) => {
            dataview['set' + method](cursor, value, littleEndian);
            cursor += consumed;
        };

        instance['get' + method + 'Array'] = (length, littleEndian) => {
            const result = new ArrayCtor(length);

            for (let i = 0; i < length; i += 1) {
                result[i] = instance['get' + method](littleEndian);
            }

            return result;
        };

        instance['set' + method + 'Array'] = (data, littleEndian) => {
            data.forEach(byte => instance['set' + method](byte, littleEndian));
        };
    });

    // define proxy properties to the dataview
    Object.defineProperties(instance, {
        buffer: {get: () => dataview.buffer},
        byteOffset: {get: () => dataview.byteOffset},
        byteLength: {get: () => dataview.byteLength}
    });

    /**
     * Seek the cursor to given position
     *
     * @param {number} pos New cursor position
     * @throws {RangeError} If the position is invalid
     * @return {null}
     */
    instance.seek = pos => {
        if (pos < 0 || pos > dataview.byteLength) {
            throw new RangeError('Trying to seek beyond limits');
        }

        cursor = pos;
    };

    /**
     * Get the cursor position
     *
     * @return {number} Current cursor position
     */
    instance.tell = () => cursor;

    /**
     * Get whether we are outside of the buffer
     *
     * @return {bool} True if current position is outside of the buffer
     */
    instance.eof = () => cursor >= dataview.byteLength;
}).props({
    /**
     * @prop {Object} buffer Pointed ArrayBuffer
     */
    buffer: undefined,

    /**
     * @prop {number} [byteOffset=0] View offset relative to the buffer
     */
    byteOffset: undefined,

    /**
     * @prop {number} [byteLength=buffer.byteLength] View length
     */
    byteLength: undefined
});

module.exports = SeekerView;
