/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Loader, Configuration} from 'webpack';
import {Command} from 'commander';
import {ParsedUrlQueryInput} from 'querystring';

export interface DocusaurusConfig {
  baseUrl: string;
  favicon: string;
  tagline?: string;
  title: string;
  url: string;
  organizationName?: string;
  projectName?: string;
  githubHost?: string;
  plugins?: PluginConfig[];
  themes?: PluginConfig[];
  presets?: PresetConfig[];
  themeConfig?: {
    [key: string]: unknown;
  };
  customFields?: {
    [key: string]: unknown;
  };
  scripts?: (
    | string
    | {
        src: string;
        [key: string]: unknown;
      }
  )[];
  stylesheets?: (
    | string
    | {
        href: string;
        [key: string]: unknown;
      }
  )[];
}

export interface DocusaurusContext {
  siteConfig?: DocusaurusConfig;
  isClient?: boolean;
}

export interface Preset {
  plugins?: PluginConfig[];
  themes?: PluginConfig[];
}

export type PresetConfig =
  | [string, Record<string, unknown>]
  | [string]
  | string;

export interface StartCLIOptions {
  port: string;
  host: string;
  hotOnly: boolean;
  open: boolean;
  poll: boolean;
}

export interface BuildCLIOptions {
  bundleAnalyzer: boolean;
  outDir: string;
  minify: boolean;
  skipBuild: boolean;
}

export interface LoadContext {
  siteDir: string;
  generatedFilesDir: string;
  siteConfig: DocusaurusConfig;
  outDir: string;
  baseUrl: string;
}

export interface InjectedHtmlTags {
  headTags: string;
  preBodyTags: string;
  postBodyTags: string;
}

export type HtmlTags = string | HtmlTagObject | (string | HtmlTagObject)[];

export interface Props extends LoadContext, InjectedHtmlTags {
  routesPaths: string[];
  plugins: Plugin<any, unknown>[];
}

export interface PluginContentLoadedActions {
  addRoute(config: RouteConfig): void;
  createData(name: string, data: any): Promise<string>;
}

export interface Plugin<T, U = unknown> {
  name: string;
  loadContent?(): Promise<T>;
  validateOptions?(): ValidationResult<U>;
  validateThemeConfig?(): ValidationResult<any>;
  contentLoaded?({
    content,
    actions,
  }: {
    content: T;
    actions: PluginContentLoadedActions;
  }): void;
  routesLoaded?(routes: RouteConfig[]): void;
  postBuild?(props: Props): void;
  postStart?(props: Props): void;
  configureWebpack?(
    config: Configuration,
    isServer: boolean,
    utils: ConfigureWebpackUtils,
  ): Configuration;
  getThemePath?(): string;
  getTypeScriptThemePath?(): string;
  getPathsToWatch?(): string[];
  getClientModules?(): string[];
  extendCli?(cli: Command): void;
  injectHtmlTags?(): {
    headTags?: HtmlTags;
    preBodyTags?: HtmlTags;
    postBodyTags?: HtmlTags;
  };
}

export type PluginConfig =
  | [string, Record<string, unknown>]
  | [string]
  | string;

export interface ChunkRegistry {
  loader: string;
  modulePath: string;
}

export type Module =
  | {
      path: string;
      __import?: boolean;
      query?: ParsedUrlQueryInput;
    }
  | string;

export interface RouteModule {
  [module: string]: Module | RouteModule | RouteModule[];
}

export interface ChunkNames {
  [name: string]: string | null | ChunkNames | ChunkNames[];
}

export interface RouteConfig {
  path: string;
  component: string;
  modules?: RouteModule;
  routes?: RouteConfig[];
  exact?: boolean;
  priority?: number;
}

export interface ThemeAlias {
  [alias: string]: string;
}

export interface ConfigureWebpackUtils {
  getStyleLoaders: (
    isServer: boolean,
    cssOptions: {
      [key: string]: unknown;
    },
  ) => Loader[];
  getCacheLoader: (
    isServer: boolean,
    cacheOptions?: Record<string, unknown>,
  ) => Loader | null;
  getBabelLoader: (
    isServer: boolean,
    babelOptions?: Record<string, unknown>,
  ) => Loader;
}

interface HtmlTagObject {
  /**
   * Attributes of the html tag
   * E.g. `{'disabled': true, 'value': 'demo', 'rel': 'preconnect'}`
   */
  attributes?: {
    [attributeName: string]: string | boolean;
  };
  /**
   * The tag name e.g. `div`, `script`, `link`, `meta`
   */
  tagName: string;
  /**
   * The inner HTML
   */
  innerHTML?: string;
}

export interface ValidationResult<T, E extends Error = Error> {
  error?: E;
  value: T;
}

export type Validate<T, E extends Error = Error> = (
  validationSchema: ValidationSchema<T>,
  options: Partial<T>,
) => ValidationResult<T, E>;

export interface OptionValidationContext<T, E extends Error = Error> {
  validate: Validate<T, E>;
  options: Partial<T>;
}

export interface ThemeConfigValidationContext<T, E extends Error = Error> {
  validate: Validate<T, E>;
  themeConfig: Partial<T>;
}

export interface ValidationSchema<T> {
  validate(options: Partial<T>, opt: object): ValidationResult<T>;
  unknown(): ValidationSchema<T>;
}
