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
 * @param {Array<module:midijs/lib/file/event~Event>} events
 * List of events in the track
 * @property {Array<module:midijs/lib/file/event~Event>} events
 * List of events in the track
 */
function Track(events) {
    this.events = events;
}

exports.Track = Track;
