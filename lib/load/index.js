const path = require('path');
const loadConfig = require('./config');
const loadDocs = require('./docs');
const loadEnv = require('./env');
const loadPages = require('./pages');
const loadTheme = require('./theme');
const {generate} = require('./utils');
const genRoutesConfig = require('./routes');

module.exports = async function load(siteDir) {
  // @tested - siteConfig
  const siteConfig = loadConfig(siteDir);

  // @tested - env
  const env = loadEnv({siteDir, siteConfig});

  // docs
  const docsDir = path.resolve(
    siteDir,
    '..',
    siteConfig.customDocsPath || 'docs'
  );
  const docsData = await loadDocs({siteDir, docsDir, env, siteConfig});
  await generate(
    'docsData.js',
    `export default ${JSON.stringify(docsData, null, 2)};`
  );

  /* Create source to permalink mapping */
  const sourceToLink = {};
  Object.values(docsData).forEach(({source, permalink}) => {
    sourceToLink[source] = permalink;
  });

  // pages
  const pagesDir = path.resolve(siteDir, 'pages');
  const pagesData = await loadPages(pagesDir);
  await generate(
    'pagesData.js',
    `export default ${JSON.stringify(pagesData, null, 2)};`
  );

  // resolve outDir
  const outDir = path.resolve(siteDir, 'build');

  // resolve the theme
  const themePath = loadTheme(siteDir);

  const baseUrl = siteConfig.baseUrl || '/';
  const versionedDir = path.join(siteDir, 'versioned_docs');
  const translatedDir = path.join(siteDir, 'translated_docs');

  const props = {
    siteConfig,
    siteDir,
    docsDir,
    docsData,
    env,
    pagesDir,
    pagesData,
    outDir,
    themePath,
    baseUrl,
    sourceToLink,
    versionedDir,
    translatedDir
  };

  // Generate React Router Config
  const routesConfig = await genRoutesConfig(props);
  await generate('routes.js', routesConfig);

  return props;
};
