/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This is a very naive implementation of converting npm commands to yarn commands
// Works well for our use case since we only use either 'npm install', or 'npm run <something>'
// Its impossible to convert it right since some commands at npm are not available in yarn and vice/versa
const convertNpmToYarn = npmCode => {
  // global install: 'npm i' -> 'yarn'
  return (
    npmCode
      .replace(/^npm i$/gm, 'yarn')
      // install: 'npm install --save foo' -> 'yarn add foo'
      .replace(/npm install --save/gm, 'yarn add')
      // run command: 'npm run start' -> 'yarn run start'
      .replace(/npm run/gm, 'yarn run')
  );
};

const transformNode = node => {
  const npmCode = node.value;
  const yarnCode = convertNpmToYarn(node.value);
  node.children = [
    {
      type: 'jsx',
      value:
        "<Tabs\n  defaultValue=\"npm\"\n  values={[\n    { label: 'npm', value: 'npm', },\n    { label: 'yarn', value: 'yarn', },\n  ]\n}>\n<TabItem value=\"npm\">",
    },
    {
      type: node.type,
      lang: node.lang,
      value: npmCode,
    },
    {
      type: 'jsx',
      value: '</TabItem>\n<TabItem value="yarn">',
    },
    {
      type: node.type,
      lang: node.lang,
      value: yarnCode,
    },
    {
      type: 'jsx',
      value: '</TabItem>\n</Tabs>',
    },
  ];
  node.type = 'element';
  delete node.lang;
  delete node.meta;
  delete node.value;
};

module.exports = () => {
  let transformed = false;
  const transformer = node => {
    if (node.type === 'code' && node.meta === 'npm2yarn') {
      transformNode(node);
      transformed = true;
    } else if (Array.isArray(node.children)) {
      node.children.forEach(transformer);
    }
    if (node.type === 'root' && transformed) {
      node.children.unshift({
        type: 'import',
        value:
          "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
      });
    }
  };
  return transformer;
};
