'use strict';

/**
 * @overview High-level classes for representing MIDI events,
 * that can be created from raw MIDI data (.decode),
 * or converted to MIDI bytes (#encode)
 */

exports.Event = require('./event');
exports.MetaEvent = require('./meta-event');
exports.SysexEvent = require('./sysex-event');
exports.ChannelEvent = require('./channel-event');
