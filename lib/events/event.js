'use strict';

/**
 * Construct a new Event
 *
 * @abstract
 * @class Event
 * @classdesc Any type of MIDI event
 *
 * @param {Object} [props={}] Event properties
 * @param {number} [defaults={}] Default event properties
 * @param {number} [delay=0] Event delay in ticks
 */
function Event(props, defaults, delay) {
    var name;

    this.delay = delay || 0;
    props = props || {};

    for (name in defaults) {
        if (defaults.hasOwnProperty(name)) {
            if (props.hasOwnProperty(name)) {
                this[name] = props[name];
            } else {
                this[name] = defaults[name];
            }
        }
    }
}

module.exports = Event;
