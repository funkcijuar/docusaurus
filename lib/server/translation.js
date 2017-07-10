/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const CWD = process.cwd();
const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const mkdirp = require("mkdirp");

console.log("translation.js triggered...");

function writeFileAndCreateFolder(file, content) {
  mkdirp.sync(file.replace(new RegExp("/[^/]*$"), ""));
  fs.writeFileSync(file, content);
}

function execute() {
  if (fs.existsSync(CWD + "/languages.js")) {
    injectContent();
  } else {
    console.log("No languages besides English enabled");
  }
}

function injectContent() {
  const I18N_JSON_DIR = CWD + "/i18n/";

  const files = glob.sync(I18N_JSON_DIR + "**");
  const languages = [];
  const langRegex = /\/i18n\/(.*)\.json$/;

  files.forEach(file => {
    const extension = path.extname(file);
    if (extension == ".json") {
      const match = langRegex.exec(file);
      const language = match[1];
      languages.push(language);
    }
  });

  let injectedContent = "";
  languages.forEach(language => {
    injectedContent +=
      "\nsiteConfig['" +
      language +
      "'] = require('./i18n/" +
      language +
      ".json');";
  });

  let siteConfigFile = fs.readFileSync(CWD + "/siteConfig.js", "utf8");
  const injectStart = "/* INJECT LOCALIZED FILES BEGIN */";
  const injectEnd = "/* INJECT LOCALIZED FILES END */";
  siteConfigFile =
    siteConfigFile.slice(
      0,
      siteConfigFile.indexOf(injectStart) + injectStart.length
    ) +
    injectedContent +
    "\n" +
    siteConfigFile.slice(siteConfigFile.indexOf(injectEnd));
  fs.writeFileSync(CWD + "/siteConfig.js", siteConfigFile);
}

module.exports = execute;
