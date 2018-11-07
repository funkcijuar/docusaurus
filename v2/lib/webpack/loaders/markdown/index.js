/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fm = require('front-matter');
const {getOptions} = require('loader-utils');
const path = require('path');
const Remarkable = require('remarkable');
const hljs = require('highlight.js');
const chalk = require('chalk');
const escapeHtml = require('escape-html');

const anchors = require('./anchors');

module.exports = function(fileString) {
  const options = getOptions(this);
  const {
    siteConfig,
    versionedDir,
    docsDir,
    translatedDir,
    sourceToMetadata,
  } = options;

  /* Extract content of markdown (without frontmatter) */
  const {body} = fm(fileString);

  /* Determine the source dir. e.g: /docs, /website/versioned_docs/version-1.0.0 */
  let sourceDir;
  const thisSource = this.resourcePath;
  if (thisSource.startsWith(translatedDir)) {
    const {language, version} = sourceToMetadata[thisSource] || {};
    if (language && version && version !== 'next') {
      sourceDir = path.join(translatedDir, language, `version-${version}`);
    } else if (language && (!version || version === 'next')) {
      sourceDir = path.join(translatedDir, language);
    }
  } else if (thisSource.startsWith(versionedDir)) {
    const {version} = sourceToMetadata[thisSource] || {};
    if (version) {
      sourceDir = path.join(versionedDir, `version-${version}`);
    }
  } else if (thisSource.startsWith(docsDir)) {
    sourceDir = docsDir;
  }

  /* Replace internal markdown linking (except in fenced blocks) */
  let content = body;
  if (sourceDir) {
    let fencedBlock = false;
    const lines = body.split('\n').map(line => {
      if (line.trim().startsWith('```')) {
        fencedBlock = !fencedBlock;
      }
      if (fencedBlock) return line;

      let modifiedLine = line;
      const inlineLinks = [];
      const refLinks = [];

      /* Replace inline-style links e.g:
      This is [Document 1](doc1.md) -> we replace this doc1.md with correct link
      */
      const inlineRegex = /(?:\]\()(?:\.\/)?([^'")\]\s>]+\.md)/g;
      let inlineMatch = inlineRegex.exec(content);
      while (inlineMatch !== null) {
        inlineLinks.push(inlineMatch[1]);
        inlineMatch = inlineRegex.exec(content);
      }

      /* Replace reference-style links e.g:
        This is [Document 1][doc1].
        [doc1]: doc1.md -> we replace this doc1.md with correct link
      */
      const refRegex = /(?:\]:)(?:\s)?(?:\.\/|\.\.\/)?([^'")\]\s>]+\.md)/g;
      let refMatch = refRegex.exec(content);
      while (refMatch !== null) {
        refLinks.push(refMatch[1]);
        refMatch = refRegex.exec(content);
      }

      [...refLinks, ...inlineLinks].forEach(mdLink => {
        const targetSource = `${sourceDir}/${mdLink}`;
        const {permalink} = sourceToMetadata[targetSource] || {};
        if (permalink) {
          modifiedLine = modifiedLine.replace(mdLink, permalink);
        }
      });
      return modifiedLine;
    });
    content = lines.join('\n');
  }

  const md = new Remarkable({
    langPrefix: 'hljs css language-',
    highlight(str, rawLang) {
      // Default language fallback
      const defaultLang =
        siteConfig.highlight && siteConfig.highlight.defaultLang;

      // No syntax highlighting
      if (rawLang === 'text' || (!rawLang && !defaultLang)) {
        return escapeHtml(str);
      }

      // User's own hljs function to register additional languages
      if (siteConfig.highlight && siteConfig.highlight.hljs) {
        siteConfig.highlight.hljs(hljs);
      }

      // Syntax highlighting
      const lang = rawLang.toLowerCase() || defaultLang;
      try {
        if (hljs.getLanguage(lang)) {
          return hljs.highlight(lang, str).value;
        }
      } catch (e) {
        console.error(
          chalk.yellow(
            `Highlight.js syntax highlighting for language "${lang}" is not supported.`,
          ),
        );
      }
      return hljs.highlightAuto(str).value;
    },
    html: true,
    linkify: true,
  });

  // Register anchors plugin
  md.use(anchors);

  // Allow client sites to register their own plugins
  if (siteConfig.markdownPlugins) {
    siteConfig.markdownPlugins.forEach(plugin => {
      md.use(plugin);
    });
  }

  // Ensure fenced code blocks use Highlight.js hljs class
  // https://github.com/jonschlinkert/remarkable/issues/224
  const html = md
    .render(content)
    .replace(/<pre><code>/g, '<pre><code class="hljs">');
  /* Return a React component */
  return `
import React from 'react';
import Markdown from '@theme/Markdown';
export default () => (
  <Markdown>
    <div dangerouslySetInnerHTML={{__html: ${JSON.stringify(html)}}} />
  </Markdown>
);`;
};
