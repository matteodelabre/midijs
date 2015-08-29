# Changelog

This is a log of all API changes that are applied to the library, version per version. All changes in a version are cumulative with those in the previous ones.

This package follows semantic versioning starting from v1.0.0. Changes in **bold font** are breaking compatibility with previous versions.

## [v1.0.0](https://github.com/MattouFP/midijs/tree/) ([compare](https://github.com/MattouFP/midijs/compare/v0.12.0...v1.0.0))

See pull request [#3](https://github.com/MattouFP/midijs/pull/3) for more information.

* **connect: remove devices, drivers support. Use the WebMIDI API or `node-midi` for this purpose.**
* **gm: remove General MIDI, integrate instruments into ChannelEvent.**
* **Error: not publicly exposed anymore.**
* **Event: type supports textual values.**
* **ChannelEvent: support all controllers.**
* **ChannelEvent: rename CONTROLLER.controller to CONTROLLER.type.**
* **ChannelEvent: rename PROGRAM_CHANGE.program to PROGRAM_CHANGE.instrument.**
* **ChannelEvent: NOTE_AFTERTOUCH.pressure defaults to 127 instead of 127.**
* **ChannelEvent: NOTE_OFF, NOTE_ON and NOTE_AFTERTOUCH accept english-written notes such as "C" or "D2#".**
* **ChannelEvent: PROGRAM_CHANGE accepts textual instrument names.**
* **ChannelEvent: CONTROLLER accepts textual constroller names.**
* **SysexEvent: add SysexEvent.TYPE.**
* **MetaEvent: allow unknown events (thanks to [@corentingurtner](https://github.com/corentingurtner)).**
* **MetaEvent: rename TIME_SIGNATURE.clockSignalsPerBeat to TIME_SIGNATURE.notated32ndsPerMIDIBeat.**
* **File: remove streams support, only expose File#encode and File.decode methods for encoding and decoding.**
* **File: add API to easily create tunes in the code, without redundancy.**
* **events: expose event classes publicly.**
* Make parsing more efficient.
* Remove editor-specific configuration.
* Add automatic coverage check.
* Add CHANGELOG.
* Move CONTRIBUTING guide apart.
* Improve README, LICENSE, CONTRIBUTING and style guide.
* Rewrite tests with tape instead of mocha.
* Use a better fixture song! ([check it out](tests/fixtures/tune.mid))
* Improve code coverage.

## [v0.12.0](https://github.com/MattouFP/midijs/tree/67f9bd1) ([compare](https://github.com/MattouFP/midijs/compare/v0.11.2...v0.12.0))

* **CHANNEL_PREFIX meta becomes MIDI_CHANNEL.**
* **Add support for MIDI_PORT meta.**

## [v0.11.2](https://github.com/MattouFP/midijs/tree/ad3842d) ([compare](https://github.com/MattouFP/midijs/compare/v0.11.1...v0.11.2))

* Add editor-specific configuration.
* Improve error messages.
* Refactoring.

## [v0.11.1](https://github.com/MattouFP/midijs/tree/171dce2) ([compare](https://github.com/MattouFP/midijs/compare/v0.11.0...v0.11.1))

* **instruments: rename to GM (this is breaking!).**
* Improve docs.
* Improve style guide.
* Reuse event parsers for outputs and inputs.

## [v0.11.0](https://github.com/MattouFP/midijs/tree/b153c9a) ([compare](https://github.com/MattouFP/midijs/compare/v0.10.2...v0.11.0))

* **File: improve streams support.**
* **Error: use custom errors.**
* **Event: add default values.**
* Rewrite chunk and events parsers.
* Add coverage.
* Improve docs and README.
* Improve coding style guide.

## [v0.10.2](https://github.com/MattouFP/midijs/tree/c4d76aa) ([compare](https://github.com/MattouFP/midijs/compare/v0.10.1...v0.10.2))

* Improve docs and package.json.

## [v0.10.1](https://github.com/MattouFP/midijs/tree/0f19445) ([compare](https://github.com/MattouFP/midijs/compare/v0.10.0...v0.10.1))

* Bundle dev dependencies.

## [v0.10.0](https://github.com/MattouFP/midijs/tree/d761073) ([compare](https://github.com/MattouFP/midijs/compare/v0.9.0...v0.10.0))

* **Reader, Writer -> File: apply merge in index.**
* Add CI.
* Improve README.
* Improve docs.

## [v0.9.0](https://github.com/MattouFP/midijs/tree/c38815b) ([compare](https://github.com/MattouFP/midijs/compare/v0.8.0...v0.9.0))

* **Event: use constants instead of strings for types.**
* **Deprecate portions of internal code.**
* Improve docs.

## [v0.8.0](https://github.com/MattouFP/midijs/tree/529411a) ([compare](https://github.com/MattouFP/midijs/compare/v0.7.5...v0.8.0))

* **Reader, Writer: merge back in one single class, File.**
* Use custom fixtures instead of fixtures from Wikipedia.
* Rewrite test suite.
* Add coding style guide.
* Internal reorganization.
* Docs improvement.

## [v0.7.5](https://github.com/MattouFP/midijs/tree/8cb8b07) ([compare](https://github.com/MattouFP/midijs/compare/v0.7.4...v0.7.5))

* Fix Output code.

## [v0.7.4](https://github.com/MattouFP/midijs/tree/f834a6a) ([compare](https://github.com/MattouFP/midijs/compare/v0.7.3...v0.7.4))

* Fix code error.

## [v0.7.3](https://github.com/MattouFP/midijs/tree/eaa0657) ([compare](https://github.com/MattouFP/midijs/compare/v0.7.2...v0.7.3))

* Improve package.json.
* Fix typo while copy-pasting...

## [v0.7.2](https://github.com/MattouFP/midijs/tree/b37bac2) ([compare](https://github.com/MattouFP/midijs/compare/v0.7.1...v0.7.2))

* Fix reference error.

## [v0.7.1](https://github.com/MattouFP/midijs/tree/60aab03) ([compare](https://github.com/MattouFP/midijs/compare/v0.7.0...v0.7.1))

* Support exotic values for Input and Outputs.

## [v0.7.0](https://github.com/MattouFP/midijs/tree/cdfbddb) ([compare](https://github.com/MattouFP/midijs/compare/v0.6.0...v0.7.0))

* **Input/Output: provide port metadata.**
* Improve docs.

## [v0.6.0](https://github.com/MattouFP/midijs/tree/e3cb636) ([compare](https://github.com/MattouFP/midijs/compare/v0.5.0...v0.6.0))

* **connect: also support inputs.**
* Improve docs.

## [v0.5.0](https://github.com/MattouFP/midijs/tree/7168dfe) ([compare](https://github.com/MattouFP/midijs/compare/v0.4.2...v0.5.0))

* **connect: only supported in the browser.**

## [v0.4.2](https://github.com/MattouFP/midijs/tree/8fa86f1) ([compare](https://github.com/MattouFP/midijs/compare/v0.4.1...v0.4.2))

* Support SMPTEOffset as a meta event.

## [v0.4.1](https://github.com/MattouFP/midijs/tree/0204cb5) ([compare](https://github.com/MattouFP/midijs/compare/v0.4.0...v0.4.1))

* **Remove keyOffset (this is breaking!).**
* Fix paths.

## [v0.4.0](https://github.com/MattouFP/midijs/tree/753ed9a) ([compare](https://github.com/MattouFP/midijs/compare/v0.3.1...v0.4.0))

* **FileReader, FileWriter: rename to Reader and Write.**
* **Reader, Writer: allow using streams for parsing/encoding.**
* Add streams examples.

## [v0.3.1](https://github.com/MattouFP/midijs/tree/434c159) ([compare](https://github.com/MattouFP/midijs/compare/v0.3.0...v0.3.1))

* Fix paths and organize files.
* Improve documentation.

## [v0.3.0](https://github.com/MattouFP/midijs/tree/eeeaad1) ([compare](https://github.com/MattouFP/midijs/compare/v0.2.0...v0.3.0))

* **File: separate into two subclasses, FileReader & FileWriter.**
* **Event: running status is stored locally, remove parameter.**
* Remove previous test fixtures and replace them with first ones.
* Write test suite for FileReader.
* Internal code improvement.
* Write a suitable README and improve docs.

## [v0.2.0](https://github.com/MattouFP/midijs/tree/18208a3) ([compare](https://github.com/MattouFP/midijs/compare/v0.1.0...v0.2.0))

* **File: remove specific methods, parse data during object construction.**
* **File: not responsible for loading files anymore. Use fs.readFile or XHR.**
* **programs: do not provide translated instrument names anymore.**
* Add LICENSE and README.
* Implement first tests, change test fixtures.
* Use BufferCursor instead of custom-implemented Stream.
* Separate parsing in subfiles to improve readability.
* Translate french error messages.
* Clean up older unused files.
* Migrate from JSHint to JSLint.

## [v0.1.0](https://github.com/MattouFP/midijs/tree/81d006c)

* Initial release.
