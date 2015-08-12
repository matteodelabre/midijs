'use strict';

/**
 * Use given key to find a constant in given enum
 * The key will be normalized to capital alphanumeric characters
 * and underscores
 *
 * @example "this is, a constant" becomes "THIS_IS_A_CONSTANT"
 * @param {Object} enum List of values
 * @param {string} key Constant key
 * @return {*} Matching key, or underfined
 */
module.exports = function selectConst(enumeration, key) {
    return enumeration[key.toUpperCase().replace(/[^A-Z0-9]+/g, '_')];
};
