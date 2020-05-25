/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

export function addTrailingSlash(str: string) {
  return str.endsWith('/') ? str : `${str}/`;
}

export function removeTrailingSlash(str: string) {
  return str.endsWith('/') ? str.slice(0, -1) : str;
}

// TODO does this function already exist?
export function getFilePathForRoutePath(routePath: string) {
  const fileName = path.basename(routePath);
  const filePath = path.dirname(routePath);
  return path.join(filePath, `${fileName}/index.html`);
}
