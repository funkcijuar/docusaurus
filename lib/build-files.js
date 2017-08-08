#!/usr/bin/env node

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

require("babel-register")({
  babelrc: false,
  plugins: [require("./server/translate-plugin.js")],
  presets: ["react", "latest", "stage-0"]
});

const generate = require("./server/generate.js");
generate();
