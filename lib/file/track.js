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
 */
function Track(events) {
    this._events = events;
}

exports.Track = Track;

/**
 * Get this track's events
 *
 * @return {Array<module:midijs/lib/event~Events>}
 */
Track.prototype.getEvents = function () {
    return [].slice.call(this._events);
};

/**
 * Get an event from this track
 *
 * @param {Number} index - Index of the event to get
 * @return {module:midijs/lib/track~Track|undefined} The event, or undefined
 */
Track.prototype.getEvent = function (index) {
    return this._events[index];
};

/**
 * Add an event to this track
 *
 * @param {Number} [index=length] - Index of the event
 * @param {module:midijs/lib/file/event~Event} event - The event to add
 * @return {module:midijs/lib/track~Track} Current instance
 */
Track.prototype.addEvent = function (index, event) {
    if (typeof index !== 'number') {
        event = index;
        index = this._events.length;
    }
    
    this._events.splice(index, 0, event);
    return this;
};

/**
 * Remove an event from this track
 *
 * @param {Number} [index=-1] - Index of the event to remove
 * @return {module:midijs/lib/track~Track} Current instance
 */
Track.prototype.removeEvent = function (index) {
    if (index === undefined) {
        index = -1;
    }
    
    this._events.splice(index, 1);
    return this;
};
