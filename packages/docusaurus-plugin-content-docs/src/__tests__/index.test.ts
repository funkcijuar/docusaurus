/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import {validate} from 'webpack';
import {isMatch} from 'picomatch';
import commander from 'commander';
import fs from 'fs-extra';
import pluginContentDocs from '../index';
import loadEnv from '../env';
import {loadContext} from '@docusaurus/core/src/server/index';
import {applyConfigureWebpack} from '@docusaurus/core/src/webpack/utils';
import {RouteConfig} from '@docusaurus/types';
import {posixPath} from '@docusaurus/utils';
import {sortConfig} from '@docusaurus/core/src/server/plugins';
import {DEFAULT_PLUGIN_ID} from '@docusaurus/core/lib/constants';

import * as version from '../version';
import {PluginOptionSchema} from '../pluginOptionSchema';
import {normalizePluginOptions} from '@docusaurus/utils-validation';

const createFakeActions = (contentDir: string) => {
  const routeConfigs: RouteConfig[] = [];
  const dataContainer: any = {};
  const globalDataContainer: any = {};

  const actions = {
    addRoute: (config: RouteConfig) => {
      routeConfigs.push(config);
    },
    createData: async (name: string, content: unknown) => {
      dataContainer[name] = content;
      return path.join(contentDir, name);
    },
    setGlobalData: (data: any) => {
      globalDataContainer.pluginName = {pluginId: data};
    },
  };

  // Extra fns useful for tests!
  const utils = {
    getGlobalData: () => globalDataContainer,
    getRouteConfigs: () => routeConfigs,
    // query by prefix, because files have a hash at the end
    // so it's not convenient to query by full filename
    getCreatedDataByPrefix: (prefix: string) => {
      const entry = Object.entries(dataContainer).find(([key]) =>
        key.startsWith(prefix),
      );
      if (!entry) {
        throw new Error(`No entry found for prefix=${prefix}`);
      }
      return JSON.parse(entry[1] as string);
    },

    expectSnapshot: () => {
      // Sort the route config like in src/server/plugins/index.ts for consistent snapshot ordering
      sortConfig(routeConfigs);
      expect(routeConfigs).not.toEqual([]);
      expect(routeConfigs).toMatchSnapshot('route config');
      expect(dataContainer).toMatchSnapshot('data');
      expect(globalDataContainer).toMatchSnapshot('global data');
    },
  };

  return {
    actions,
    utils,
  };
};

test('site with wrong sidebar file', async () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'simple-site');
  const context = loadContext(siteDir);
  const sidebarPath = path.join(siteDir, 'wrong-sidebars.json');
  const plugin = pluginContentDocs(
    context,
    normalizePluginOptions(PluginOptionSchema, {
      sidebarPath,
    }),
  );
  await expect(plugin.loadContent()).rejects.toThrowErrorMatchingSnapshot();
});

describe('empty/no docs website', () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'empty-site');
  const context = loadContext(siteDir);

  test('no files in docs folder', async () => {
    await fs.ensureDir(path.join(siteDir, 'docs'));
    const plugin = pluginContentDocs(
      context,
      normalizePluginOptions(PluginOptionSchema, {}),
    );
    const content = await plugin.loadContent();
    const {docsMetadata, docsSidebars} = content;
    expect(docsMetadata).toMatchInlineSnapshot(`Object {}`);
    expect(docsSidebars).toMatchInlineSnapshot(`Object {}`);

    const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);
    const {actions, utils} = createFakeActions(pluginContentDir);

    await plugin.contentLoaded({
      content,
      actions,
    });

    expect(utils.getRouteConfigs()).toEqual([]);
  });

  test('docs folder does not exist', async () => {
    const plugin = pluginContentDocs(
      context,
      normalizePluginOptions(PluginOptionSchema, {
        path: '/path/does/not/exist/',
      }),
    );
    const content = await plugin.loadContent();
    expect(content).toBeNull();
  });
});

describe('simple website', () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'simple-site');
  const context = loadContext(siteDir);
  const sidebarPath = path.join(siteDir, 'sidebars.json');
  const pluginPath = 'docs';
  const plugin = pluginContentDocs(
    context,
    normalizePluginOptions(PluginOptionSchema, {
      path: pluginPath,
      sidebarPath,
      homePageId: 'hello',
    }),
  );
  const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);

  test('extendCli - docsVersion', () => {
    const mock = jest.spyOn(version, 'docsVersion').mockImplementation();
    const cli = new commander.Command();
    plugin.extendCli(cli);
    cli.parse(['node', 'test', 'docs:version', '1.0.0']);
    expect(mock).toHaveBeenCalledWith('1.0.0', siteDir, DEFAULT_PLUGIN_ID, {
      path: pluginPath,
      sidebarPath,
    });
    mock.mockRestore();
  });

  test('getPathToWatch', () => {
    const pathToWatch = plugin.getPathsToWatch();
    const matchPattern = pathToWatch.map((filepath) =>
      posixPath(path.relative(siteDir, filepath)),
    );
    expect(matchPattern).not.toEqual([]);
    expect(matchPattern).toMatchInlineSnapshot(`
      Array [
        "docs/**/*.{md,mdx}",
        "sidebars.json",
      ]
    `);
    expect(isMatch('docs/hello.md', matchPattern)).toEqual(true);
    expect(isMatch('docs/hello.mdx', matchPattern)).toEqual(true);
    expect(isMatch('docs/foo/bar.md', matchPattern)).toEqual(true);
    expect(isMatch('docs/hello.js', matchPattern)).toEqual(false);
    expect(isMatch('docs/super.mdl', matchPattern)).toEqual(false);
    expect(isMatch('docs/mdx', matchPattern)).toEqual(false);
    expect(isMatch('sidebars.json', matchPattern)).toEqual(true);
    expect(isMatch('versioned_docs/hello.md', matchPattern)).toEqual(false);
    expect(isMatch('hello.md', matchPattern)).toEqual(false);
    expect(isMatch('super/docs/hello.md', matchPattern)).toEqual(false);
  });

  test('configureWebpack', async () => {
    const config = applyConfigureWebpack(
      plugin.configureWebpack,
      {
        entry: './src/index.js',
        output: {
          filename: 'main.js',
          path: path.resolve(__dirname, 'dist'),
        },
      },
      false,
    );
    const errors = validate(config);
    expect(errors.length).toBe(0);
  });

  test('content', async () => {
    const content = await plugin.loadContent();
    const {
      docsMetadata,
      docsSidebars,
      versionToSidebars,
      permalinkToSidebar,
    } = content;
    expect(versionToSidebars).toEqual({});
    expect(docsMetadata.hello).toEqual({
      id: 'hello',
      unversionedId: 'hello',
      isDocsHomePage: true,
      permalink: '/docs/',
      previous: {
        title: 'baz',
        permalink: '/docs/foo/bazSlug.html',
      },
      sidebar: 'docs',
      source: path.join('@site', pluginPath, 'hello.md'),
      title: 'Hello, World !',
      description: 'Hi, Endilie here :)',
    });

    expect(docsMetadata['foo/bar']).toEqual({
      id: 'foo/bar',
      unversionedId: 'foo/bar',
      isDocsHomePage: false,
      next: {
        title: 'baz',
        permalink: '/docs/foo/bazSlug.html',
      },
      permalink: '/docs/foo/bar',
      sidebar: 'docs',
      source: path.join('@site', pluginPath, 'foo', 'bar.md'),
      title: 'Bar',
      description: 'This is custom description',
    });

    expect(docsSidebars).toMatchSnapshot();

    const {actions, utils} = createFakeActions(pluginContentDir);

    await plugin.contentLoaded({
      content,
      actions,
    });

    // There is only one nested docs route for simple site
    const baseMetadata = utils.getCreatedDataByPrefix('docs-route-');
    expect(baseMetadata.docsSidebars).toEqual(docsSidebars);
    expect(baseMetadata.permalinkToSidebar).toEqual(permalinkToSidebar);

    utils.expectSnapshot();
    expect(utils.getGlobalData()).toMatchSnapshot();
  });
});

describe('versioned website', () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'versioned-site');
  const context = loadContext(siteDir);
  const sidebarPath = path.join(siteDir, 'sidebars.json');
  const routeBasePath = 'docs';
  const plugin = pluginContentDocs(
    context,
    normalizePluginOptions(PluginOptionSchema, {
      routeBasePath,
      sidebarPath,
      homePageId: 'hello',
    }),
  );
  const env = loadEnv(siteDir, DEFAULT_PLUGIN_ID);
  const {docsDir: versionedDir} = env.versioning;
  const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);

  test('isVersioned', () => {
    expect(env.versioning.enabled).toEqual(true);
  });

  test('extendCli - docsVersion', () => {
    const mock = jest.spyOn(version, 'docsVersion').mockImplementation();
    const cli = new commander.Command();
    plugin.extendCli(cli);
    cli.parse(['node', 'test', 'docs:version', '2.0.0']);
    expect(mock).toHaveBeenCalledWith('2.0.0', siteDir, DEFAULT_PLUGIN_ID, {
      path: routeBasePath,
      sidebarPath,
    });
    mock.mockRestore();
  });

  test('getPathToWatch', () => {
    const pathToWatch = plugin.getPathsToWatch();
    const matchPattern = pathToWatch.map((filepath) =>
      posixPath(path.relative(siteDir, filepath)),
    );
    expect(matchPattern).not.toEqual([]);
    expect(matchPattern).toMatchInlineSnapshot(`
      Array [
        "docs/**/*.{md,mdx}",
        "versioned_sidebars/version-1.0.1-sidebars.json",
        "versioned_sidebars/version-1.0.0-sidebars.json",
        "versioned_sidebars/version-withSlugs-sidebars.json",
        "versioned_docs/version-1.0.1/**/*.{md,mdx}",
        "versioned_docs/version-1.0.0/**/*.{md,mdx}",
        "versioned_docs/version-withSlugs/**/*.{md,mdx}",
        "sidebars.json",
      ]
    `);
    expect(isMatch('docs/hello.md', matchPattern)).toEqual(true);
    expect(isMatch('docs/hello.mdx', matchPattern)).toEqual(true);
    expect(isMatch('docs/foo/bar.md', matchPattern)).toEqual(true);
    expect(isMatch('sidebars.json', matchPattern)).toEqual(true);
    expect(
      isMatch('versioned_docs/version-1.0.0/hello.md', matchPattern),
    ).toEqual(true);
    expect(
      isMatch('versioned_docs/version-1.0.0/foo/bar.md', matchPattern),
    ).toEqual(true);
    expect(
      isMatch('versioned_sidebars/version-1.0.0-sidebars.json', matchPattern),
    ).toEqual(true);

    // Non existing version
    expect(
      isMatch('versioned_docs/version-2.0.0/foo/bar.md', matchPattern),
    ).toEqual(false);
    expect(
      isMatch('versioned_docs/version-2.0.0/hello.md', matchPattern),
    ).toEqual(false);
    expect(
      isMatch('versioned_sidebars/version-2.0.0-sidebars.json', matchPattern),
    ).toEqual(false);

    expect(isMatch('docs/hello.js', matchPattern)).toEqual(false);
    expect(isMatch('docs/super.mdl', matchPattern)).toEqual(false);
    expect(isMatch('docs/mdx', matchPattern)).toEqual(false);
    expect(isMatch('hello.md', matchPattern)).toEqual(false);
    expect(isMatch('super/docs/hello.md', matchPattern)).toEqual(false);
  });

  test('content', async () => {
    const content = await plugin.loadContent();
    const {
      docsMetadata,
      docsSidebars,
      versionToSidebars,
      permalinkToSidebar,
    } = content;

    // foo/baz.md only exists in version -1.0.0
    expect(docsMetadata['foo/baz']).toBeUndefined();
    expect(docsMetadata['version-1.0.1/foo/baz']).toBeUndefined();
    expect(docsMetadata['foo/bar']).toEqual({
      id: 'foo/bar',
      unversionedId: 'foo/bar',
      isDocsHomePage: false,
      permalink: '/docs/next/foo/barSlug',
      source: path.join('@site', routeBasePath, 'foo', 'bar.md'),
      title: 'bar',
      description: 'This is next version of bar.',
      version: 'next',
      sidebar: 'docs',
      next: {
        title: 'hello',
        permalink: '/docs/next/',
      },
    });
    expect(docsMetadata.hello).toEqual({
      id: 'hello',
      unversionedId: 'hello',
      isDocsHomePage: true,
      permalink: '/docs/next/',
      source: path.join('@site', routeBasePath, 'hello.md'),
      title: 'hello',
      description: 'Hello next !',
      version: 'next',
      sidebar: 'docs',
      previous: {
        title: 'bar',
        permalink: '/docs/next/foo/barSlug',
      },
    });
    expect(docsMetadata['version-1.0.1/hello']).toEqual({
      id: 'version-1.0.1/hello',
      unversionedId: 'hello',
      isDocsHomePage: true,
      permalink: '/docs/',
      source: path.join(
        '@site',
        path.relative(siteDir, versionedDir),
        'version-1.0.1',
        'hello.md',
      ),
      title: 'hello',
      description: 'Hello 1.0.1 !',
      version: '1.0.1',
      sidebar: 'version-1.0.1/docs',
      previous: {
        title: 'bar',
        permalink: '/docs/foo/bar',
      },
    });
    expect(docsMetadata['version-1.0.0/foo/baz']).toEqual({
      id: 'version-1.0.0/foo/baz',
      unversionedId: 'foo/baz',
      isDocsHomePage: false,
      permalink: '/docs/1.0.0/foo/baz',
      source: path.join(
        '@site',
        path.relative(siteDir, versionedDir),
        'version-1.0.0',
        'foo',
        'baz.md',
      ),
      title: 'baz',
      description:
        'Baz 1.0.0 ! This will be deleted in next subsequent versions.',
      version: '1.0.0',
      sidebar: 'version-1.0.0/docs',
      next: {
        title: 'hello',
        permalink: '/docs/1.0.0/',
      },
      previous: {
        title: 'bar',
        permalink: '/docs/1.0.0/foo/barSlug',
      },
    });

    expect(docsSidebars).toMatchSnapshot('all sidebars');
    expect(versionToSidebars).toMatchSnapshot(
      'sidebars needed for each version',
    );
    const {actions, utils} = createFakeActions(pluginContentDir);
    await plugin.contentLoaded({
      content,
      actions,
    });

    // The created base metadata for each nested docs route is smartly chunked/ splitted across version
    const latestVersionBaseMetadata = utils.getCreatedDataByPrefix(
      'docs-route-',
    );
    expect(latestVersionBaseMetadata).toMatchSnapshot(
      'base metadata for latest version',
    );
    expect(latestVersionBaseMetadata.docsSidebars).not.toEqual(docsSidebars);
    expect(latestVersionBaseMetadata.permalinkToSidebar).not.toEqual(
      permalinkToSidebar,
    );
    const nextVersionBaseMetadata = utils.getCreatedDataByPrefix(
      'docs-next-route-',
    );
    expect(nextVersionBaseMetadata).toMatchSnapshot(
      'base metadata for next version',
    );
    expect(nextVersionBaseMetadata.docsSidebars).not.toEqual(docsSidebars);
    expect(nextVersionBaseMetadata.permalinkToSidebar).not.toEqual(
      permalinkToSidebar,
    );
    const firstVersionBaseMetadata = utils.getCreatedDataByPrefix(
      'docs-1-0-0-route-',
    );
    expect(firstVersionBaseMetadata).toMatchSnapshot(
      'base metadata for first version',
    );
    expect(nextVersionBaseMetadata.docsSidebars).not.toEqual(docsSidebars);
    expect(nextVersionBaseMetadata.permalinkToSidebar).not.toEqual(
      permalinkToSidebar,
    );

    utils.expectSnapshot();
  });
});

describe('versioned website (community)', () => {
  const siteDir = path.join(__dirname, '__fixtures__', 'versioned-site');
  const context = loadContext(siteDir);
  const sidebarPath = path.join(siteDir, 'community_sidebars.json');
  const routeBasePath = 'community';
  const pluginId = 'community';
  const plugin = pluginContentDocs(
    context,
    normalizePluginOptions(PluginOptionSchema, {
      id: 'community',
      path: 'community',
      routeBasePath,
      sidebarPath,
    }),
  );
  const env = loadEnv(siteDir, pluginId);
  const {docsDir: versionedDir} = env.versioning;
  const pluginContentDir = path.join(context.generatedFilesDir, plugin.name);

  test('isVersioned', () => {
    expect(env.versioning.enabled).toEqual(true);
  });

  test('extendCli - docsVersion', () => {
    const mock = jest.spyOn(version, 'docsVersion').mockImplementation();
    const cli = new commander.Command();
    plugin.extendCli(cli);
    cli.parse(['node', 'test', `docs:version:${pluginId}`, '2.0.0']);
    expect(mock).toHaveBeenCalledWith('2.0.0', siteDir, pluginId, {
      path: routeBasePath,
      sidebarPath,
    });
    mock.mockRestore();
  });

  test('getPathToWatch', () => {
    const pathToWatch = plugin.getPathsToWatch();
    const matchPattern = pathToWatch.map((filepath) =>
      posixPath(path.relative(siteDir, filepath)),
    );
    expect(matchPattern).not.toEqual([]);
    expect(matchPattern).toMatchInlineSnapshot(`
      Array [
        "community/**/*.{md,mdx}",
        "community_versioned_sidebars/version-1.0.0-sidebars.json",
        "community_versioned_docs/version-1.0.0/**/*.{md,mdx}",
        "community_sidebars.json",
      ]
    `);
    expect(isMatch('community/team.md', matchPattern)).toEqual(true);
    expect(
      isMatch('community_versioned_docs/version-1.0.0/team.md', matchPattern),
    ).toEqual(true);

    // Non existing version
    expect(
      isMatch('community_versioned_docs/version-2.0.0/team.md', matchPattern),
    ).toEqual(false);
    expect(
      isMatch(
        'community_versioned_sidebars/version-2.0.0-sidebars.json',
        matchPattern,
      ),
    ).toEqual(false);

    expect(isMatch('community/team.js', matchPattern)).toEqual(false);
    expect(
      isMatch('community_versioned_docs/version-1.0.0/team.js', matchPattern),
    ).toEqual(false);
  });

  test('content', async () => {
    const content = await plugin.loadContent();
    const {
      docsMetadata,
      docsSidebars,
      versionToSidebars,
      permalinkToSidebar,
    } = content;

    expect(docsMetadata.team).toEqual({
      id: 'team',
      unversionedId: 'team',
      isDocsHomePage: false,
      permalink: '/community/next/team',
      source: path.join('@site', routeBasePath, 'team.md'),
      title: 'team',
      description: 'Team current version',
      version: 'next',
      sidebar: 'community',
    });
    expect(docsMetadata['version-1.0.0/team']).toEqual({
      id: 'version-1.0.0/team',
      unversionedId: 'team',
      isDocsHomePage: false,
      permalink: '/community/team',
      source: path.join(
        '@site',
        path.relative(siteDir, versionedDir),
        'version-1.0.0',
        'team.md',
      ),
      title: 'team',
      description: 'Team 1.0.0',
      version: '1.0.0',
      sidebar: 'version-1.0.0/community',
    });

    expect(docsSidebars).toMatchSnapshot('all sidebars');
    expect(versionToSidebars).toMatchSnapshot(
      'sidebars needed for each version',
    );

    const {actions, utils} = createFakeActions(pluginContentDir);
    await plugin.contentLoaded({
      content,
      actions,
    });

    // The created base metadata for each nested docs route is smartly chunked/ splitted across version
    const latestVersionBaseMetadata = utils.getCreatedDataByPrefix(
      'community-route-',
    );
    expect(latestVersionBaseMetadata).toMatchSnapshot(
      'base metadata for latest version',
    );
    expect(latestVersionBaseMetadata.docsSidebars).not.toEqual(docsSidebars);
    expect(latestVersionBaseMetadata.permalinkToSidebar).not.toEqual(
      permalinkToSidebar,
    );
    const nextVersionBaseMetadata = utils.getCreatedDataByPrefix(
      'community-next-route-',
    );
    expect(nextVersionBaseMetadata).toMatchSnapshot(
      'base metadata for next version',
    );
    expect(nextVersionBaseMetadata.docsSidebars).not.toEqual(docsSidebars);
    expect(nextVersionBaseMetadata.permalinkToSidebar).not.toEqual(
      permalinkToSidebar,
    );

    utils.expectSnapshot();
  });
});
