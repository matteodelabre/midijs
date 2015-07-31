'use strict';

var Input = require('./device/input').Input;
var Output = require('./device/output').Output;
var Promise = require('promise');
var midi = require('midi');

var accessCache;

/**
 * Get an access to the MIDI driver, in a navigator, if it
 * wasn't already granted
 *
 * @return {Promise} Resolved with the access
 */
function getWebAccess() {
    if (accessCache) {
        return Promise.resolve(accessCache);
    }

    return navigator.requestMIDIAccess().then(function (access) {
        accessCache = access;
        return access;
    });
}

/**
 * Get an Input or Output device through the web interface
 *
 * @param {string} id Device identifier
 * @param {string} type 'input' or 'output'
 * @return {Promise} Resolved with matching object
 */
function getWebPort(id, type) {
    return getWebAccess().then(function (access) {
        var port = access[type + 's'].get(id);

        if (!port) {
            throw new Error('Unknown port "' + id + '"');
        }

        return port.open();
    }).then(function (port) {
        var emitter;

        if (type === 'output') {
            return new Output(port, port.send.bind(port));
        } else {
            emitter = new EventEmitter();
            port.onmidimessage = emitter.emit.bind(emitter, 'message');

            return new Input(port, emitter);
        }
    });
}

/**
 * Get a list of available Input or Output devices' identifiers
 *
 * @param {string} type 'input' or 'output'
 * @return {Promise} Resolved with a list of identifiers
 */
function getWebPorts(type) {
    return getWebAccess().then(function (access) {
        var ports = access[type + 's'], ids = [];

        ports.forEach(function (port, id) {
            ids.push(id);
        });

        return ids;
    });
}

/**
 * Get the input MIDI device with given identifier
 *
 * @param {string} id Device identifier
 * @return {Promise} Resolved with an Input object
 */
exports.getInput = function (id) {
    var input;

    if (global.navigator) {
        return getWebPort(id, 'input');
    }

    id = parseInt(id, 10);

    try {
        input = new midi.input();
        input.openPort(id);
    } catch (e) {
        return Promise.reject(e);
    }

    return Promise.resolve(new Input({
        id: id,
        name: input.getPortName(id)
    }, input));
};

/**
 * Get a list of available input devices' identifiers
 *
 * @return {Promise} Resolved with the list of identifiers
 */
exports.getInputs = function () {
    var input, count, ids = [], i = 0;

    if (global.navigator) {
        return getWebPorts('input');
    }

    input = new midi.input();
    count = input.getPortCount();

    while (i < count) {
        ids.push(i.toString());
        i += 1;
    }

    return Promise.resolve(ids);
};

/**
 * Get an output MIDI device with given identifier
 *
 * @param {string} id Device identifier
 * @return {Promise} Resolved with an Output object
 */
exports.getOutput = function (id) {
    var output;

    if (global.navigator) {
        return getWebPort(id, 'output');
    }

    id = parseInt(id, 10);

    try {
        output = new midi.output();
        output.openPort(id);
    } catch (e) {
        return Promise.reject(e);
    }

    return Promise.resolve(new Output({
        id: id,
        name: output.getPortName(id)
    }, output.sendMessage.bind(output)));
};

/**
 * Get a list of available output devices' identifiers
 *
 * @return {Promise} Resolved with the list of identifiers
 */
exports.getOutputs = function () {
    var output, count, ids = [], i = 0;

    if (global.navigator) {
        return getWebPorts('output');
    }

    output = new midi.output();
    count = output.getPortCount();

    while (i < count) {
        ids.push(i.toString());
        i += 1;
    }

    return Promise.resolve(ids);
};

exports.Input = Input;
exports.Output = Output;
