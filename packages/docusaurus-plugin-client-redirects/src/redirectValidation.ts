/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isValidPathname} from '@docusaurus/utils';
import * as Yup from 'yup';
import {RedirectMetadata} from './types';

const validPathnameTest: Yup.TestOptions = {
  name: 'isValidPathname',
  message:
    '${path} is not a valid pathname. Pathname should start with / and not contain any domain or query string',
  test: isValidPathname,
};

export const PathnameValidator = Yup.string().test(validPathnameTest);

const RedirectSchema = Yup.object<RedirectMetadata>({
  fromRoutePath: PathnameValidator.required(),
  toRoutePath: PathnameValidator.required(),
});

export function validateRedirect(redirect: RedirectMetadata) {
  try {
    RedirectSchema.validateSync(redirect);
  } catch (e) {
    // Tells the user which redirect is the problem!
    throw new Error(
      `${JSON.stringify(redirect)} => Validation error: ${e.message}`,
    );
  }
}
