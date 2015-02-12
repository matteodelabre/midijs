'use strict';

var id = 0;

/**
 * Track
 *
 * Represent a Standard MIDI file track
 *
 * @param {events: Array[Event]}   List of events in the file
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
