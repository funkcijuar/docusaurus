/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useContext} from 'react';
import DocusaurusContext from '@docusaurus/context';

function useDocusaurusContext() {
  return useContext(DocusaurusContext);
}

export default useDocusaurusContext;
