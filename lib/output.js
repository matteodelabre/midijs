/*jshint node:true, browser:true */

'use strict';

/**
 * MIDI output wrapper
 *
 * Add helper methods to ease working with
 * native MIDI output.
 *
 * @param {native: MIDIOutput}  Native MIDIOutput to wrap around
 */
function Output(native) {
    this.native = native || {
        send: function () {}
    };
}

/**
 * List of MIDI channel events
 */
Output.messages = {
    noteOff: 0x80,
    noteOn: 0x90,
    noteAftertouch: 0xA0,
    controller: 0xB0,
    programChange: 0xC0,
    channelAftertouch: 0xD0,
    pitchBend: 0xE0
};

/**
 * List of controller types
 * (not complete)
 */
Output.controllers = {
    modulationWheel: 1,
    volume: 7,
    pan: 10,
    expression: 11,
    sustainPedal: 64
};

/**
 * Change program on a channel
 *
 * Send a MIDI message to change program on given channel, after
 * given delay.
 *
 * @param {channel: int}    Channel ID (0 - 15)
 * @param {program: int}    Program ID (0 - 127; see programs.js)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.programChange = function (channel, program, delay) {
    this.native.send([
        Output.messages.programChange + channel,
        program
    ], (delay || 0) * 1000);
};

/**
 * Press a note on a channel
 *
 * Send a MIDI message to press a note on given channel, with
 * given velocity, after given delay.
 *
 * @param {channel: int}    Channel ID (0 - 15)
 * @param {note: int}       Note ID (0 - 127)
 * @param {velocity: int}   Pressing velocity (0 - 127)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.noteOn = function (channel, note, velocity, delay) {
    this.native.send([
        Output.messages.noteOn + channel,
        note,
        velocity
    ], (delay || 0) * 1000);
};

/**
 * Release a note on a channel
 *
 * Send a MIDI message to release a note given channel, after
 * given delay.
 *
 * @param {channel: int}    Channel ID
 * @param {program: int}    Note ID (0 - 127)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.noteOff = function (channel, note, delay) {
    this.native.send([
        Output.messages.noteOff + channel,
        note,
        0
    ], (delay || 0) * 1000);
};


/**
 * Set note aftertouch on a channel
 *
 * Send a MIDI message to change note pressure, after given delay,
 * on given channel.
 *
 * @param {channel: int}    Channel ID
 * @param {program: int}    Note ID (0 - 127)
 * @param {pressure: int}   Pressure amount (0 - 127)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.noteAftertouch = function (channel, note, pressure, delay) {
    this.native.send([
        Output.messages.noteAftertouch + channel,
        note,
        pressure
    ], (delay || 0) * 1000);
};

/**
 * Apply a controller to a channel
 *
 * Send a MIDI message to change channel state using
 * a controller, after given delay (see Output.controllers for
 * a list of controllers).
 *
 * @param {channel: int}    Channel ID
 * @param {controller: int} Controller type (0 - 127)
 * @param {value: int}      Controller value (0 - 127)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.controller = function (channel, controller, value, delay) {
    this.native.send([
        Output.messages.controller + channel,
        controller,
        value
    ], (delay || 0) * 1000);
};

/**
 * Set global note aftertouch on a channel
 *
 * Send a MIDI message to change all notes pressure,
 * after given delay, on given channel.
 *
 * @param {channel: int}    Channel ID
 * @param {pressure: int}   Pressure amount (0 - 127)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.channelAftertouch = function (channel, pressure, delay) {
    this.native.send([
        Output.messages.channelAftertouch + channel,
        pressure
    ], (delay || 0) * 1000);
};

/**
 * Increase or decrease pitch on a channel
 *
 * Send a MIDI message to increase or decrease pitch value, after given delay,
 * on given channel.
 *
 * @param {channel: int}    Channel ID
 * @param {value: int}      Pitch variation (-8192 - 8191)
 * @param {delay: int}      Delay in seconds
 */
Output.prototype.pitchBend = function (channel, value, delay) {
    var lsb, msb;

    value += 8192;
    lsb = value & 127;
    msb = value >> 7;

    this.native.send([
        Output.messages.pitchBend + channel,
        lsb,
        msb
    ], (delay || 0) * 1000);
};

module.exports = Output;