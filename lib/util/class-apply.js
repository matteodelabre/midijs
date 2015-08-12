'use strict';

/**
 * Create an object using given constructor with given arguments
 *
 * @param {function} Ctor Constructor to use
 * @param {Array} args Arguments to Pass
 * @see http://stackoverflow.com/a/8843181/3452708
 * @return {Ctor} Instanciated object
 */
module.exports = function (Ctor, args) {
    return new (Ctor.bind.apply(Ctor, [null].concat([].slice.call(args))));
};
