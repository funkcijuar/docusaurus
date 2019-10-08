---
id: advanced-themes
title: Themes
---

In this doc, we discuss how themes are designed and how you can write your own themes.

## Themes design

While themes share the exact same lifecycle methods with plugins, their implementations can look very different from those of plugins based on themes' designed objectives.

Themes are designed to complete the build of your Docusaurus site and supply the components used by your site, plugins, and the themes themselves. So a typical theme implementation would look like a `src/index.js` file that hooks it up to the lifecycle methods. Most likely they would not use `loadContent`, which plugins would use. And it is typically accompanied by a `src/theme` directory full of components.

To summarize:

- Themes share the same lifecycle methods with Plugins
- Themes are run after all existing Plugins
- Themes exist to add component aliases by extending the webpack config

## Writing customized Docusaurus themes

A Docusaurus theme normally includes an `index.js` file where you hook up to the lifecycle methods, alongside with a `theme/` directory of components. A typical Docusaurus theme folder looks like this:

```shell
.
├── package.json
└── src
    ├── index.js
    └── theme
        ├── MyThemeComponent
        └── AnotherThemeComponent.js
```

There are two lifecycle methods that are essential to theme implementation:

**`getThemePath`**

Returns the path to the directory where the theme components can be found. When your users calls `swizzle`, `getThemePath` is called and its returned path is used to find your theme components.

If you use the folder directory above, your `getThemePath` can be:

```js
// my-theme/src/index.js

const path = require('path');
module.exports = function(context, options) {
  return {
    name: 'name-of-my-theme',
    getThemePath() {
      return path.resolve(__dirname, './theme');
    },
  };
};
```

**`getClientModules`**

Returns an array of paths to the modules that are to be imported in the client bundle. These modules are imported globally before React even renders the initial UI.

As an example, to make your theme load a `customCss` object from `options` passed in by the user:

```js
// my-theme/src/index.js

const path = require('path');
module.exports = function(context, options) {
  const {customCss} = options || {};
  return {
    name: 'name-of-my-theme',
    getClientModules() {
      return [customCss];
    },
  };
};
```

<!--

Advanced guide on:
- customizing themes
- creating your own themes
- swizzling components

Related pieces
---
- [Guides – Themes](using-themes.md)
- [API - Themes](api-themes.md)

References
---
- [classic themes](packages/docusaurus-theme-classic/src/index.js)
- [using plugins doc](using-plugins.md)
- [vuepress docs on themes](https://v1.vuepress.vuejs.org/theme/)

-->
