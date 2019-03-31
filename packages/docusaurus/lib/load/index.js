/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ejs = require('ejs');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');

const {generate} = require('@docusaurus/utils');
const loadConfig = require('./config');
const loadEnv = require('./env');
const loadTheme = require('./theme');
const loadRoutes = require('./routes');
const loadPlugins = require('./plugins');
const constants = require('../constants');

module.exports = async function load(siteDir, cliOptions = {}) {
  const generatedFilesDir = path.resolve(
    siteDir,
    constants.GENERATED_FILES_DIR_NAME,
  );
  fs.ensureDirSync(generatedFilesDir);

  // Site Config
  const siteConfig = loadConfig.loadConfig(siteDir);
  await generate(
    generatedFilesDir,
    loadConfig.configFileName,
    `export default ${JSON.stringify(siteConfig, null, 2)};`,
  );

  // Env
  const env = loadEnv({siteDir, siteConfig});
  await generate(
    generatedFilesDir,
    'env.js',
    `export default ${JSON.stringify(env, null, 2)};`,
  );

  // Process plugins.
  const pluginConfigs = siteConfig.plugins || [];
  const context = {env, siteDir, generatedFilesDir, siteConfig, cliOptions};
  const {
    plugins,
    pluginsRouteConfigs,
    pluginsLoadedContent,
  } = await loadPlugins({
    pluginConfigs,
    context,
  });

  // Resolve outDir.
  const outDir = path.resolve(siteDir, 'build');

  // Resolve theme.
  const themePath = loadTheme(siteDir);

  const {baseUrl} = siteConfig;
  const versionedDir = path.join(siteDir, 'versioned_docs');
  const translatedDir = path.join(siteDir, 'translated_docs');

  // TODO: Make doc dependents use the plugin's content instead
  // of passing in via props.
  const {
    docsDir,
    docs: docsMetadata,
    sourceToMetadata,
  } = pluginsLoadedContent[0].content;

  // Generate React Router Config.
  const {routesConfig, routesPaths} = await loadRoutes(pluginsRouteConfigs);
  await generate(generatedFilesDir, 'routes.js', routesConfig);

  // Generate contents metadata.
  const metadataTemplateFile = path.resolve(
    __dirname,
    '../core/templates/metadata.template.ejs',
  );
  const metadataTemplate = fs.readFileSync(metadataTemplateFile).toString();
  const pluginMetadataImports = _.compact(pluginsLoadedContent).map(
    ({metadataKey, contentPath}) => ({
      name: metadataKey,
      path: contentPath,
    }),
  );

  const metadataFile = ejs.render(metadataTemplate, {
    imports: [
      ...pluginMetadataImports,
      {
        name: 'env',
        path: '@generated/env',
      },
    ],
  });
  await generate(generatedFilesDir, 'metadata.js', metadataFile);

  const props = {
    siteConfig,
    siteDir,
    docsDir,
    docsMetadata,
    env,
    outDir,
    themePath,
    baseUrl,
    sourceToMetadata,
    versionedDir,
    translatedDir,
    generatedFilesDir,
    routesPaths,
    plugins,
  };

  return props;
};
