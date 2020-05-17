/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import renderRoutes from '@docusaurus/renderRoutes';
import MDXComponents from '@theme/MDXComponents';
import Layout from '@theme/Layout';
import {MDXProvider} from '@mdx-js/react';

function DocPage(props) {
  const {route: baseRoute} = props;

  return (
    <Layout title="Blog page" description="My blog page">
      <div className="container mt-4">
        <section className="row justify-content-center">
          <MDXProvider components={MDXComponents}>
            {renderRoutes(baseRoute.routes)}
          </MDXProvider>
        </section>
      </div>
    </Layout>
  );
}

export default DocPage;
