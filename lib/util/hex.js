'use strict';

/**
 * Format a number to an hexadecimal representation
 *
 * @param {number} number Number to format
 * @return {string} Formatted number
 */
exports.format = function (number) {
    return '0x' + number.toString(16).toUpperCase();
};
