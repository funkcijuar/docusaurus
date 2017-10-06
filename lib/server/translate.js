/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const translation = require("./translation.js");

let language = "en";

/* handle escaped characters that get converted into json strings */
function parseEscapeSequences(str) {
  return str
    .replace(new RegExp("\\\\n", "g"), "\n")
    .replace(new RegExp("\\\\b", "g"), "\b")
    .replace(new RegExp("\\\\f", "g"), "\f")
    .replace(new RegExp("\\\\r", "g"), "\r")
    .replace(new RegExp("\\\\t", "g"), "\t")
    .replace(new RegExp("\\\\'", "g"), "'")
    .replace(new RegExp('\\\\"', "g"), '"')
    .replace(new RegExp("\\\\", "g"), "\\");
}

function setLanguage(lang) {
  language = lang;
}

function translate(str) {
  if (
    !translation[language] ||
    !translation[language]["pages-strings"] ||
    !translation[language]["pages-strings"][str]
  ) {
    throw new Error(
      "Text that you've identified for translation hasn't been added to the global list in 'en.json'. To solve this problem run 'yarn write-translations'."
    );
  }
  console.log(translation[language]);
  console.log(translation[language]["pages-strings"]);
  console.log(translation[language]["pages-strings"][str]);
  return parseEscapeSequences(translation[language]["pages-strings"][str]);
}

module.exports = {
  setLanguage: setLanguage,
  translate: translate
};
