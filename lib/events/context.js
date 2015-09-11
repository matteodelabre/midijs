'use strict';

var objectAssign = require('object-assign');

var MIDIBuffer = require('../util/buffer');
var MalformedError = require('../util/errors').MalformedError;

var MetaEvent = require('./meta-event');
var SysexEvent = require('./sysex-event');
var ChannelEvent = require('./channel-event');

var vintLength = MIDIBuffer.getVarIntLength;

function Context(options) {
    this.lastStatus = null;
    this.options = objectAssign({
        device: false,
        runningStatus: null
    }, options || {});

    // assign the default configuration for devices:
    // accept incoming running statuses but avoid producing them
    if (this.options.device && this.options.runningStatus === null) {
        this.options.runningStatus = {
            in: true,
            out: false
        };
    }

    // expand booleans to objects
    if (this.options.runningStatus === false) {
        this.options.runningStatus = {
            in: false,
            out: false
        };
    } else if (this.options.runningStatus === true ||
               this.options.runningStatus === null) {
        this.options.runningStatus = {
            in: true,
            out: true
        };
    }
}

module.exports = Context;

Context.prototype.reset = function () {
    this.lastStatus = null;
};

Context.prototype.decode = function (input) {
    var buf = new MIDIBuffer(input), results = [],
        delay, status;

    while (!buf.eof()) {
        if (!this.options.device) {
            delay = buf.readVarInt();
        } else {
            delay = 0;
        }

        status = buf.readUIntLE(8);

        // use running status if enabled and applicable
        if (this.options.runningStatus.in && (status & 0x80) === 0) {
            if (this.lastStatus === null) {
                throw new MalformedError(
                    'File byte instructs to use the previous status for ' +
                    'current event, but it is the first event in the sequence'
                );
            }

            status = this.lastStatus;
            buf.seek(buf.tell() - 1);
        } else {
            if (status >= 0xF0 && status <= 0xF7) { // 0xF0 - 0xF7 reset rs
                this.lastStatus = null;
            } else if (status < 0xF8) { // 0xF8 - 0xFF ignore running status
                this.lastStatus = status;
            }
        }

        if (status === 0xFF) {
            results.push(MetaEvent.decode(delay, status, buf));
        } else if (status === 0xF0 || status === 0xF7) {
            results.push(SysexEvent.decode(delay, status, buf));
        } else if (status >= 0x80 && status < 0xF0) {
            results.push(ChannelEvent.decode(delay, status, buf));
        } else {
            throw new MalformedError(
                'Current event has a status that is neither a ' +
                'meta, sysex nor channel event (0x' + status.toString(16) + ')'
            );
        }
    }

    return results;
};

Context.prototype.encode = function (events) {
    if (!Array.isArray(events)) {
        events = [events];
    }

    return Buffer.concat(events.map(function (event) {
        var result = event.encode().toBuffer(),
            status = result[0], extended;

        // use running status if enabled and applicable
        if (this.options.runningStatus.out && status === this.lastStatus) {
            result = result.slice(1);
        } else {
            if (status >= 0xF0 && status <= 0xF7) { // 0xF0 - 0xF7 reset rs
                this.lastStatus = null;
            } else if (status < 0xF8) { // 0xF8 - 0xFF ignore running status
                this.lastStatus = status;
            }
        }

        // add delay bytes if not device
        if (!this.options.device) {
            extended = new MIDIBuffer(result.length + vintLength(event.delay));
            extended.writeVarInt(event.delay);
            extended.copy(result);

            result = extended.toBuffer();
        }

        return result;
    }, this));
};
