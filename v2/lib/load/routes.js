/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {normalizeUrl} = require('./utils');

async function genRoutesConfig({
  siteConfig = {},
  docsMetadatas = {},
  pagesMetadatas = [],
  pluginRouteConfigs = [],
}) {
  const imports = [
    `import React from 'react';`,
    `import Loadable from 'react-loadable';`,
    `import Loading from '@theme/Loading';`,
    `import Doc from '@theme/Doc';`,
    `import DocBody from '@theme/DocBody';`,
    `import Pages from '@theme/Pages';`,
    `import NotFound from '@theme/NotFound';`,
  ];

  // Docs.
  const {docsUrl, baseUrl} = siteConfig;
  function genDocsRoute(metadata) {
    const {permalink, source} = metadata;
    return `
{
  path: '${permalink}',
  exact: true,
  component: Loadable({
    loader: () => import('${source}'),
    loading: Loading,
    render(loaded, props) {
      let Content = loaded.default;
      return (
        <DocBody {...props} metadata={${JSON.stringify(metadata)}}>
          <Content />
        </DocBody>
      );
    }
  })
}`;
  }

  const rootDocsUrl = normalizeUrl([baseUrl, docsUrl]);
  const docsRoutes = `
{
  path: '${rootDocsUrl}',
  component: Doc,
  routes: [${Object.values(docsMetadatas)
    .map(genDocsRoute)
    .join(',')}],
}`;

  // Pages.
  function genPagesRoute(metadata) {
    const {permalink, source} = metadata;
    return `
{
  path: '${permalink}',
  exact: true,
  component: Loadable({
    loader: () => import('${source}'),
    loading: Loading,
    render(loaded, props) {
      let Content = loaded.default;
      return (
        <Pages {...props} metadata={${JSON.stringify(metadata)}}>
          <Content {...props} metadata={${JSON.stringify(metadata)}} />
        </Pages>
      );
    }
  })
}`;
  }

  const notFoundRoute = `
{
  path: '*',
  component: NotFound,
}`;

  const routes = pluginRouteConfigs.map(pluginRouteConfig => {
    const {path, component, metadata, modules} = pluginRouteConfig;
    return `
{
  path: '${path}',
  exact: true,
  component: Loadable.Map({
    loader: {
${modules
      .map(
        (module, index) => `      Module${index}: () => import('${module}'),`,
      )
      .join('\n')}
      Component: () => import('${component}'),
    },
    loading: Loading,
    render(loaded, props) {
      const Component = loaded.Component.default;
      const modules = [
${modules
      .map((module, index) => `        loaded.Module${index}.default,`)
      .join('\n')}
      ];
      return (
        <Component {...props} metadata={${JSON.stringify(
          metadata,
        )}} modules={modules}/>
      );
    }
  })
}`;
  });

  return `
${imports.join('\n')}

const routes = [
// Docs.${pagesMetadatas.map(genPagesRoute).join(',')},

// Pages.${docsRoutes},

// Plugins.${routes.join(',')},

// Not Found.${notFoundRoute},
];

export default routes;\n`;
}

module.exports = genRoutesConfig;
