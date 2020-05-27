/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {flatten, uniqBy} from 'lodash';
import {
  RedirectsCreator,
  PluginContext,
  RedirectMetadata,
  PluginOptions,
} from './types';
import {
  fromExtensionsRedirectCreator,
  toExtensionsRedirectCreator,
} from './redirectCreators';

export default function collectRedirects(
  pluginContext: PluginContext,
): RedirectMetadata[] {
  const redirects = doCollectRedirects(pluginContext);
  return filterUnwantedRedirects(redirects, pluginContext);
}

function filterUnwantedRedirects(
  redirects: RedirectMetadata[],
  pluginContext: PluginContext,
): RedirectMetadata[] {
  // TODO how should we warn the user of filtered redirects?

  // we don't want to create twice the same redirect
  redirects = uniqBy(redirects, (redirect) => redirect.fromRoutePath);

  // We don't want to override an existing route
  redirects = redirects.filter(
    (redirect) => !pluginContext.routesPaths.includes(redirect.fromRoutePath),
  );

  return redirects;
}

function doCollectRedirects(pluginContext: PluginContext): RedirectMetadata[] {
  const redirectsCreators: RedirectsCreator[] = buildRedirectCreators(
    pluginContext.options,
  );

  return flatten(
    redirectsCreators.map((redirectCreator) => {
      return createRoutesPathsRedirects(redirectCreator, pluginContext);
    }),
  );
}

function buildRedirectCreators(options: PluginOptions): RedirectsCreator[] {
  const noopRedirectCreator: RedirectsCreator = (_routePath: string) => [];
  return [
    fromExtensionsRedirectCreator(options.fromExtensions),
    toExtensionsRedirectCreator(options.toExtensions),
    options.createRedirects ?? noopRedirectCreator,
  ];
}

// Create all redirects for a list of route path
function createRoutesPathsRedirects(
  redirectCreator: RedirectsCreator,
  pluginContext: PluginContext,
): RedirectMetadata[] {
  return flatten(
    pluginContext.routesPaths.map((routePath) =>
      createRoutePathRedirects(routePath, redirectCreator),
    ),
  );
}

// Create all redirects for a single route path
function createRoutePathRedirects(
  routePath: string,
  redirectCreator: RedirectsCreator,
): RedirectMetadata[] {
  const fromRoutePaths: string[] = redirectCreator(routePath) ?? [];
  return fromRoutePaths.map((fromRoutePath) => {
    return {
      fromRoutePath,
      toRoutePath: routePath,
    };
  });
}
