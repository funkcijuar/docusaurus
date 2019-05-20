/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import WebpackNiceLog from 'webpack-nicelog';
import merge from 'webpack-merge';
import {Configuration} from 'webpack';

import {createBaseConfig} from './base';
import WaitPlugin from './plugins/WaitPlugin';
import {Props} from '../server';

export function createServerConfig(props: Props): Configuration {
  const {baseUrl, routesPaths, outDir} = props;
  const config = createBaseConfig(props, true);
  const isProd = process.env.NODE_ENV === 'production';

  const routesLocation = {};
  // Array of paths to be rendered. Relative to output directory
  const ssgPaths = routesPaths.map(str => {
    const ssgPath =
      baseUrl === '/' ? str : str.replace(new RegExp(`^${baseUrl}`), '/');
    routesLocation[ssgPath] = str;
    return ssgPath;
  });
  const serverConfig = merge(config, {
    entry: {
      main: path.resolve(__dirname, '../client/serverEntry.js'),
    },
    output: {
      filename: 'server.bundle.js',
      libraryTarget: 'commonjs2',
      // Workaround for Webpack 4 Bug (https://github.com/webpack/webpack/issues/6522)
      globalObject: 'this',
    },
    target: 'node',
    plugins: [
      // Wait until manifest from client bundle is generated
      new WaitPlugin({
        filepath: path.join(outDir, 'client-manifest.json'),
      }),

      // Static site generator webpack plugin.
      new StaticSiteGeneratorPlugin({
        entry: 'main',
        locals: {
          baseUrl,
          outDir,
          routesLocation,
        },
        paths: ssgPaths,
      }),

      // Show compilation progress bar.
      new WebpackNiceLog({
        name: 'Server',
        color: 'yellow',
        skipBuildTime: isProd,
      }),
    ],
  });
  return serverConfig;
}
