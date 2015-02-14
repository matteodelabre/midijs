/**
 * @private
 * @module midijs/lib/file/track
 */

'use strict';

/**
 * Track
 *
 * Represent a Standard MIDI file track
 *
 * @constructor
 * @param {Array<module:midijs/lib/event.Event>} events - List of events in
 *                                                        the track
 */
function Track(events) {
    if (arguments.length > 1) {
        this.events = [].slice.call(arguments);
    } else if (events === undefined || events === null) {
        this.events = [];
    } else {
        this.events = [].slice.call(events);
    }
}

exports.Track = Track;
