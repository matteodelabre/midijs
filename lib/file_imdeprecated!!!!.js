/*jshint node:true, browser:true */

'use strict';

var Note = require('./note');
var Channel = require('./channel');

/**
 * Convert stained data
 *
 * @param {data: string}    Original data
 * @return string
 */
function convertStained(data) {
    var converted, length, i;

    converted = [];
    length = data.length;

    for (i = 0; i < length; i += 1) {
        converted[i] = String.fromCharCode(
            data.charCodeAt(i) & 255
        );
    }

    return converted.join("");
}

/**
 * Push note on pending notes stack
 *
 * @param {meta: Object}    Meta object for this song
 * @param {event: Object}   Event describing noteOn
 * @param {time: int}       Starting time
 */
function pushNote(meta, event, time) {
    var channel = event.channel,
        note = event.noteNumber;

    meta.channels[channel].pending[note] = new Note({
        start: time,
        channel: channel,
        note: note
    });
}

/**
 * Pop note from given stack and add it to notes list
 *
 * @param {meta: Object}    Meta object for this song
 * @param {event: Object}   Event describing noteOff
 * @param {time: int}       Ending time
 */
function popNote(meta, event, time) {
    var channel = event.channel,
        note = event.noteNumber,
        data;

    data = meta.channels[channel].pending[note];

    if (data === undefined) {
        return;
    }

    data.length = time - data.start;

    meta.length = Math.max(
        meta.length,
        time
    );

    meta.notes.push(data);
    delete meta.channels[channel].pending[note];
}

/**
 * Import given MIDI file and translate
 * MIDI data object
 *
 * @param {data: string}    MIDI data
 * @return Promise
 */
function parse(data) {
    return new window.Promise(function (resolve, reject) {
        var tracks, events, tracksLength, eventsLength, length,
            event, i, j,
            // parsing data
            timeline = [], meta = {},
            channelPrefix = null, metaObject,
            // timing
            time, bpm = 120, tpb,
            firstNote = +Infinity, offset;

        // check MIDI structure and load events
        data = convertStained(data);

        try {
            data = new MidiFile(data);
        } catch (err) {
            if (err === 'Bad .mid file - header not found') {
                reject(new Error(
                    'Le fichier n\'est pas un fichier MIDI ' +
                        'valide. Ce logiciel ne prend en charge ' +
                        'que les fichiers de type MIDI.'
                ));
            } else {
                reject(new Error(
                    'Le fichier MIDI n\'est pas correctement ' +
                        'formé. Il contient une erreur qui ' +
                        'empêche le logiciel de le lire ' +
                        'correctement. Veuillez rapporter ' +
                        'ce problème aux auteurs du fichier.'
                ));
            }
        }

        tracks = data.tracks;
        tracksLength = tracks.length;
        tpb = data.header.ticksPerBeat;

        // prepare meta object
        meta = {
            names: [],
            instruments: [],
            channels: [],
            notes: [],
            markers: [],
            copyright: '',
            lyrics: '',
            length: 0
        };

        // init channels
        length = 16;

        for (i = 0; i < length; i += 1) {
            meta.channels[i] = new Channel(i);
        }

        // parse all events
        for (i = 0; i < tracksLength; i += 1) {
            time = 0;
            events = tracks[i];
            eventsLength = events.length;

            for (j = 0; j < eventsLength; j += 1) {
                event = events[j];

                // time of each event is relative from last track event
                if (event.deltaTime) {
                    time += event.deltaTime / tpb / (bpm / 60);
                }

                if (event.type === 'meta') {
                    if (event.subtype === 'midiChannelPrefix') {
                        channelPrefix = event.channel;
                    } else {
                        if (channelPrefix !== null) {
                            metaObject =
                                meta.channels[channelPrefix];
                        } else {
                            metaObject = meta;
                        }
                    }

                    switch (event.subtype) {
                    case 'trackName':
                        metaObject.names[i] = event.text;
                        break;
                    case 'copyrightNotice':
                        metaObject.copyright = event.text;
                        break;
                    case 'lyrics':
                        metaObject.lyrics = event.text;
                        break;
                    case 'instrumentName':
                        metaObject.instruments[i] = event.text;
                        break;
                    case 'marker':
                        metaObject.markers.push({
                            time: time,
                            text: event.text
                        });
                        break;
                    case 'setTempo':
                        bpm = 60000000 / event.microsecondsPerBeat;
                        break;
                    }
                } else if (event.type === 'channel') {
                    channelPrefix = null;

                    switch (event.subtype) {
                    case 'noteOn':
                        firstNote = Math.min(firstNote, time);
                        pushNote(meta, event, time);
                        timeline.push({
                            type: 'noteOn',
                            time: time,
                            note: event.noteNumber,
                            channel: event.channel,
                            velocity: event.velocity
                        });
                        break;
                    case 'noteOff':
                        popNote(meta, event, time);
                        timeline.push({
                            type: 'noteOff',
                            time: time,
                            note: event.noteNumber,
                            channel: event.channel
                        });
                        break;
                    case 'noteAftertouch':
                        timeline.push({
                            type: 'noteAftertouch',
                            time: time,
                            note: event.noteNumber,
                            channel: event.channel,
                            amount: event.amount
                        });
                        break;
                    case 'controller':
                        timeline.push({
                            type: 'controller',
                            time: time,
                            subtype: event.controllerType,
                            value: event.value,
                            channel: event.channel
                        });
                        break;
                    case 'programChange':
                        meta.channels[event.channel].program =
                            event.programNumber;
                        break;
                    }
                }
            }
        }

        // normalize starting time: always have 1s delay
        if (firstNote < +Infinity) {
            offset = 1 - firstNote;
        }

        meta.length += offset;
        length = timeline.length;

        for (i = 0; i < length; i += 1) {
            event = timeline[i];

            if (event.time + offset < 0) {
                event.time = 0;
            } else {
                event.time += offset;
            }
        }

        length = meta.notes.length;

        for (i = 0; i < length; i += 1) {
            meta.notes[i].start += offset;
        }

        resolve({
            meta: meta,
            timeline: timeline
        });
    });
}

exports.load = load;
exports.parse = parse;