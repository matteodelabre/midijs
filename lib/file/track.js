/**
 * @private
 * @module midijs/lib/file/track
 */

'use strict';

var Event = require('./event').Event;

/**
 * Track
 *
 * Represent a Standard MIDI file track
 *
 * @constructor
 * @param {Array<module:midijs/lib/file/event~Event>} events
 * List of events in the track
 * @property {Array<module:midijs/lib/file/event~Event>} events
 * List of events in the track
 */
function Track(events) {
    if (arguments.length > 1) {
        this.events = [].slice.call(arguments);
    } else if (events === undefined || events === null) {
        this.events = [];
    } else if (events instanceof Event) {
        this.events = [events];
    } else {
        this.events = [].slice.call(events);
    }
}

exports.Track = Track;
