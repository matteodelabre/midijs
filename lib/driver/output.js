/*jslint node:true, browser:true, bitwise:true */

'use strict';

var hexTypes = {
    noteOff: 0x8,
    noteOn: 0x9,
    noteAftertouch: 0xA,
    controller: 0xB,
    programChange: 0xC,
    channelAftertouch: 0xD,
    pitchBend: 0xE
};

/**
 * Output wrapper
 *
 * Add helper methods to ease working with
 * native MIDI outputs.
 *
 * @param {native: MIDIOutput}  Native MIDI output to wrap
 */
function Output(native) {
    this.native = native;
    
    this.id = native.id;
    this.manufacturer = native.manufacturer;
    this.name = native.name;
    this.version = native.version;
}

exports.Output = Output;

/**
 * Send a MIDI event to the output
 *
 * @param {event: EventChannel} MIDI event to send
 */
Output.prototype.send = function (event) {
    var subtype = event.subtype, data = [],
        lsb, msb, value;
    
    data.push(hexTypes[event.subtype] + event.channel);
    
    switch (subtype) {
    case 8:
    case 9:
        data.push(event.note, event.velocity);
        break;
    case 10:
        data.push(event.note, event.pressure);
        break;
    case 11:
        data.push(event.controller, event.value);
        break;
    case 12:
        data.push(event.program);
        break;
    case 13:
        data.push(event.pressure);
        break;
    case 14:
        value = event.value + 8192;
        lsb = value & 127;
        msb = value >> 7;
        
        data.push(lsb, msb);
        break;
    }
    
    this.native.send(data, event.delay || 0);
};