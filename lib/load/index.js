const fs = require('fs-extra');
const path = require('path');
const loadConfig = require('./config');
const loadDocs = require('./docs');
const loadPages = require('./pages');
const {generate} = require('./utils');
const genRoutesConfig = require('./routes');

module.exports = async function load(siteDir) {
  // siteConfig
  const siteConfig = loadConfig(siteDir);

  // docs
  const docsDir = path.resolve(
    siteDir,
    '..',
    siteConfig.customDocsPath || 'docs'
  );
  const docsData = await loadDocs(docsDir);
  await generate(
    'docsData.js',
    `export default ${JSON.stringify(docsData, null, 2)};`
  );

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
  const customThemePath = path.resolve(siteDir, 'theme');
  const themePath = fs.existsSync(customThemePath)
    ? customThemePath
    : path.resolve(__dirname, '../theme');

  const themeComponents = ['Docs', 'Loading', 'NotFound'];
  themeComponents.forEach(component => {
    if (!require.resolve(path.join(themePath, component))) {
      throw new Error(
        `Failed to load ${themePath}/${component}. It does not exist.`
      );
    }
  });

  const baseUrl = siteConfig.baseUrl || '/';

  const props = {
    siteConfig,
    siteDir,
    docsDir,
    docsData,
    pagesDir,
    pagesData,
    outDir,
    themePath,
    baseUrl
  };

  // Generate React Router Config
  const routesConfig = await genRoutesConfig(props);
  await generate('routes.js', routesConfig);

  return props;
};
