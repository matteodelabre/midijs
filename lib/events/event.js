'use strict';

/**
 * Construct a new Event
 *
 * @abstract
 * @class Event
 * @classdesc Any type of MIDI event
 *
 * @param {number} [delay=0] Event delay in ticks
 */
function Event(delay) {
    if (this.constructor === Event) {
        throw new Error('Cannot instanciate Event directly');
    }

    this.delay = delay || 0;
}

module.exports = Event;
