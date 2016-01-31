'use strict';

const stampit = require('stampit');
const SeekerView = require('./seekerview');

/**
 * MIDIView stamp
 *
 * An augmented SeekerView that provides methods for
 * reading and writing variable-length integers as
 * defined by the MIDI specification
 *
 * @see SeekerView
 */
const MIDIView = stampit().static({
    /**
     * @type {number} Maximal variable integer quantity
     */
    MAX_VAR_INT: 0x0FFFFFFF,

    /**
     * Get the byte-length of the number as a variable integer
     *
     * @static
     * @param {number} value Number to encode
     * @return {number} Byte-length of the variable integer, or false if too large
     */
    getVarIntLength(value) {
        let length = 0;

        if (value > MIDIView.MAX_VAR_INT) {
            return false;
        }

        value = Math.abs(parseInt(value, 10));

        do {
            length += 1;
            value >>= 7;
        } while (value > 0);

        return length;
    }
}).methods({
    /**
     * Write a value as a variable integer in the buffer,
     * an integer that will span 1 to 4 bytes depending on
     * its value, as defined by the MIDI specification
     *
     * @param {number} value Value to write
     * @return {null}
     */
    setVarInt(value) {
        const bytes = [];

        // ensure we work with valid values
        if (value > MIDIView.MAX_VAR_INT) {
            throw new RangeError('This number is too large for a variable integer');
        }

        value = Math.abs(parseInt(value, 10));

        do {
            bytes.push(value & 0x7F);
            value >>= 7;
        } while (value > 0);

        let length = bytes.length;

        for (let i = length - 1; i >= 0; i -= 1) {
            if (i > 0) {
                bytes[i] |= 0x80;
            }

            this.setUint8(bytes[i]);
        }
    },

    /**
     * Read a variable integer, a integer that can span
     * from 1 to 4 bytes depending on its size, as defined
     * by the MIDI specification
     *
     * @return {number} Read value
     */
    getVarInt() {
        let value = 0, byte, count = 0;

        do {
            byte = this.getUint8();

            value <<= 7;
            value |= byte & 0x7F;
            count += 1;
        } while ((byte & 0x80) && count < 4);

        return value;
    }
}).compose(SeekerView);

module.exports = MIDIView;
