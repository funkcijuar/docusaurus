/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DocusaurusPluginSitemap from '../index';

describe('docusaurus-plugin-sitemap', () => {
  describe('createSitemap', () => {
    test('simple site', async () => {
      const context = {
        siteConfig: {
          url: 'https://example.com',
        },
        routesPaths: ['/', '/test'],
      };
      const plugin = new DocusaurusPluginSitemap(context, null);
      const sitemap = await plugin.createSitemap(context);
      expect(sitemap).toContain(
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
      );
    });

    test('empty site', async () => {
      const context = {};
      const plugin = new DocusaurusPluginSitemap(context, null);
      expect(
        plugin.createSitemap(context),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Url in docusaurus.config.js cannot be empty/undefined"`,
      );
    });
  });
});
