/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: "Prettier",
    image: "/img/prettier.png",
    infoLink: "https://www.prettier.io",
    pinned: true
  },
  {
    caption: "FastText",
    image: "/img/fasttext.png",
    infoLink: "https://fasttext.cc",
    pinned: true
  },
  {
    caption: "Jest",
    image: "/img/jest.png",
    infoLink: "https://facebook.github.io/jest/",
    pinned: true
  },
  {
    caption: "Reason React",
    image: "/img/reason-react.svg",
    infoLink: "https://reasonml.github.io/reason-react/",
    pinned: true
  },
  {
    caption: "MakeItOpen",
    image: "/img/makeitopen.png",
    infoLink: "http://makeitopen.com/",
    pinned: true
  },
  {
    caption: "Docusaurus",
    image: "/img/docusaurus.svg",
    infoLink: "https://www.docusaurus.io",
    pinned: true
  }
];

const siteConfig = {
  title: "Docusaurus",
  tagline: "Easy to Maintain Open Source Documentation Websites",
  url: "https://docusaurus.io",
  baseUrl: "/",
  organizationName: "facebook",
  projectName: "Docusaurus",
  cname: "docusaurus.io",
  noIndex: true,
  users,
  editUrl:
    "https://github.com/facebook/docusaurus/edit/master/docs/",
  headerLinks: [
    { doc: "installation", label: "Docs" },
    { page: "help", label: "Help" },
    { blog: true, label: "Blog" },
    {
      href: "https://github.com/facebook/docusaurus",
      label: "GitHub"
    }
  ],
  headerIcon: "img/docusaurus.svg",
  footerIcon: "img/docusaurus_monochrome.svg",
  favicon: "img/docusaurus.ico",
  algolia: {
    apiKey: "3eb9507824b8be89e7a199ecaa1a9d2c",
    indexName: "docusaurus"
  },
  colors: {
    primaryColor: "#2E8555",
    secondaryColor: "#205C3B"
  },
  translationRecruitingLink: "https://crowdin.com/project/docusaurus",
  copyright: "Copyright © " + new Date().getFullYear() + " Facebook Inc.",
  highlight: {
    theme: "solarized-dark"
  },
  scripts: ["https://buttons.github.io/buttons.js"]
};

module.exports = siteConfig;
