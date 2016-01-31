'use strict';

/**
 * @overview Entry point for midijs
 */

exports.File = require('./lib/files/file');
exports.events = {
    Context: require('./lib/events/context'),
    MetaEvent: require('./lib/events/meta-event'),
    SysexEvent: require('./lib/events/sysex-event'),
    ChannelEvent: require('./lib/events/channel-event')
};
