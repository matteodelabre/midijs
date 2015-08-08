# Contributing

All contributions are welcome! If you want a new feature
to be added or a bug to be fixed, you can propose your changes
using a pull request.

There are a few rules to follow so that the repo
stays consistent.

## 1. Commit tags

All commits should be tagged with emojis to make
the commit list more readable. (If you forget it, that's
not a problem, though.)

| Emoji      | Commit content        |
|:----------:|:--------------------- |
| :book:     | Documentation updates |
| :bug:      | Bug fixes             |
| :ledger:   | Rename/move files     |
| :bulb:     | Features              |
| :lipstick: | Fix coding style      |

## 2. Branches

Please use a branch name that differs from `master`
when making pull requests, so that the network history is more
readable.

For example, if you wanted to improve the documentation
you could have chosen something like: `improve-docs`.

## 3. Coding style

JavaScript can be authored following
[a](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
[lot](https://github.com/airbnb/javascript)
[of](https://github.com/felixge/node-style-guide)
[different](https://contribute.jquery.org/style-guide/js/)
[coding styles](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Coding_Style),
and here's some style rules that should be followed whenever possible.

All of these rules are also stored in `.eslintrc`, so that
you can use [ESLint](http://eslint.org/) to ensure that your code
complies with them.

* Use the radix parameter in `parseInt()` calls.
* Declare all your variables at the top of the functions.
* Use the *one true brace style*.
* Use strict mode.
* Avoid yoda conditions.
* Put semicolons to avoid ASI.
* Put one space after commas, and no space before.
* Use consistent spacing.
* Put your comma at the end of the lines.
* Use single quotes.
* Use camel-case.
* Use 4 spaces for indentation.
