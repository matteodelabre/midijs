'use strict';

var id = 0;

/**
 * Track
 *
 * Represent a Standard MIDI file track
 *
 * @constructor
 * @param {Array<Event>} events - List of events in the track
 */
function Track(events) {
    this.id = 'TRACK_' + id;
    
    if (events === undefined || events === null) {
        this.events = [];
    } else {
        this.events = [].slice.call(events);
    }
    
    id += 1;
}

exports.Track = Track;
