# Change log

This is a log of all API changes to the library, version per version. It follows advices from [keepachangelog.com](http://keepachangelog.com/).
All releases following v1.0.0 follow semantic versioning ‒ for previous releases, read the change log for more information.

## [v1.0.0](https://github.com/matteodelabre/midijs/releases/tag/v1.0.0) ― 2016-01-24

*See pull request [#3](https://github.com/matteodelabre/midijs/pull/3) for* more information.

#### Added

* `Event` accepts strings in some arguments (`Event` type can be given with a string, `PROGRAM_CHANGE` accepts a string for specifying the instrument, `CONTROLLER` accepts a string for specifying the controller).
* `CONTROLLER` now supports all kinds of controllers.
* `NOTE_OFF`, `NOTE_ON` and `NOTE_AFTERTOUCH` accept English-written notes such as "C" or "D2#".
* New `TYPE` property on `SysexEvent`s for consistency.
* `encode` and `decode` methods on `File`, replacing previous ones.
* New API on `File` for creating tunes from the code.
* `Event` subclasses are now publicly exposed.

#### Changed

* `gm` module. Instruments literals have been integrated into `ChannelEvent`.
* `CONTROLLER#controller` has been renamed to `CONTROLLER#type`.
* `PROGRAM_CHANGE#program` has been renamed to `PROGRAM_CHANGE#instrument`.
* `TIME_SIGNATURE#clockSignalsPerBeat` has been renamed to `TIME_SIGNATURE#notated32ndsPerMIDIBeat`.
* `NOTE_AFTERTOUCH#pressure` defaults to 127 instead of 0.
* Unknown events doesn't generate exceptions but sets an `unknown` flag to true. (Thanks to [@corentingurtner](https://github.com/corentingurtner)).

#### Removed

* `connect` module. Use the WebMIDI API or `node-midi` for this purpose.
* `Error` subclasses.
* `Event` class.
* All previous methods of `File`, including support for streams.

## [v0.12.0](https://github.com/matteodelabre/midijs/releases/tag/v0.12.0) ― 2015-05-08

#### Added

* Support `MIDI_PORT` meta event.

#### Changed

* Rename `CHANNEL_PREFIX` meta event to `MIDI_CHANNEL`.

## [v0.11.2](https://github.com/matteodelabre/midijs/releases/tag/v0.11.2) ― 2015-05-01

#### Changed

* Improve error messages.

## [v0.11.1](https://github.com/matteodelabre/midijs/releases/tag/v0.11.1) ― 2015-04-30

#### Changed

* Rename the `instruments` module to `GM` (despite the release number, this is a breaking change).

## [v0.11.0](https://github.com/matteodelabre/midijs/releases/tag/v0.11.0) ― 2015-02-18

#### Added

* Default values in `Event`.
* Custom error classes.

#### Changed

* Improved streams support in `File`.

## [v0.10.2](https://github.com/matteodelabre/midijs/releases/tag/v0.10.2) ― 2015-02-14

*No visible changes.*

## [v0.10.1](https://github.com/matteodelabre/midijs/releases/tag/v0.10.1) ― 2015-02-14

*No visible changes.*

## [v0.10.0](https://github.com/matteodelabre/midijs/releases/tag/v0.10.0) ― 2015-02-14

#### Added

* New `File` class merging `Reader` and `Writer`.

#### Removed

* `Reader` and `Writer` classes, merged in `File`.

## [v0.9.0](https://github.com/matteodelabre/midijs/releases/tag/v0.9.0) ― 2015-02-14

#### Changed

* Use constants instead of strings for `Event` types.

#### Deprecated

* Portions of internal, non-documented code.

## [v0.8.0](https://github.com/matteodelabre/midijs/releases/tag/v0.8.0) ― 2015-02-13

#### Changed

* Documentation improvements.
* Rewrite the test suite.

## [v0.7.5](https://github.com/matteodelabre/midijs/releases/tag/v0.7.5) ― 2015-02-01

#### Fixed

* Fix `Output#send` producing wrong MIDI data.

## [v0.7.4](https://github.com/matteodelabre/midijs/releases/tag/v0.7.4) ― 2015-02-01

#### Fixed

* Fix wrong subtype checks.

## [v0.7.3](https://github.com/matteodelabre/midijs/releases/tag/v0.7.3) ― 2015-02-01

#### Changed

* Added `repository` field in package.json.

#### Fixed

* Fixed `Driver#send` method.

## [v0.7.2](https://github.com/matteodelabre/midijs/releases/tag/v0.7.2) ― 2015-02-01

#### Fixed

* Tried to fix `Driver#send` method (and failed; use 0.7.3 instead).

## [v0.7.1](https://github.com/matteodelabre/midijs/releases/tag/v0.7.1) ― 2015-02-01

#### Fixed

* Do not crash with falsy `Input`/`Output` values.

## [v0.7.0](https://github.com/matteodelabre/midijs/releases/tag/v0.7.1) ― 2015-02-01

#### Added

* Add port metadata in `Input`/`Output`.

## [v0.6.0](https://github.com/matteodelabre/midijs/releases/tag/v0.6.0) ― 2015-02-01

#### Added

* Support inputs in `connect` module.

## [v0.5.0](https://github.com/matteodelabre/midijs/releases/tag/v0.5.0) ― 2015-02-01

#### Changed

* `connect` is only supported in the browser.

## [v0.4.2](https://github.com/matteodelabre/midijs/releases/tag/v0.4.2) ― 2015-01-31

#### Added

* Support for the `SMTPEOffset` meta event.

## [v0.4.1](https://github.com/matteodelabre/midijs/releases/tag/v0.4.1) ― 2015-01-31

#### Removed

* Remove keyOffset in `programs` (despite the release number, this is a breaking change).

#### Fixed

* Typos in paths.

## [v0.4.0](https://github.com/matteodelabre/midijs/releases/tag/v0.4.0) ― 2015-01-31

#### Added

* Support streams with `Reader` and `Writer`.

#### Changed

* `FileReader` and `FileWriter` have been renamed to `Reader` and `Writer`.

## [v0.3.1](https://github.com/matteodelabre/midijs/releases/tag/v0.3.1) ― 2015-01-25

*No visible changes.*

## [v0.3.0](https://github.com/matteodelabre/midijs/releases/tag/v0.3.0) ― 2015-01-25

#### Added

* `FileReader`, `FileWriter` instead of `File`.
* Test suite for `FileReader`.

#### Changed

* Wrote a real README file.

#### Removed

* `Event` constructor's running status parameter. Stored internally instead.

## [v0.2.0](https://github.com/matteodelabre/midijs/releases/tag/v0.2.0) ― 2015-01-25

#### Added

* Added LICENSE and README.

#### Changed

* `File` doesn't load files by itself. Use `fs.readFile` or a XHR object instead.
* Error messages are now in English.
* Use JSLint instead of JSHint for code-style checking.

#### Removed

* `programs` doesn't provide localized instrument names anymore.
* Remove undocumented internal method in `File` (`File#_parseMetaEvent`, `File#_parseEvent`, `File#_parseSystemEvent`, `File#_parseChannelEvent`).

## [v0.1.0](https://github.com/matteodelabre/midijs/releases/tag/v0.1.0) ― 2014-12-30

*Initial release.*
