#!/usr/bin/env node

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const shell = require("shelljs");

const GIT_USER = process.env.GIT_USER;
const CIRCLE_BRANCH = process.env.CIRCLE_BRANCH;
const CIRCLE_PROJECT_USERNAME = process.env.CIRCLE_PROJECT_USERNAME;
const CIRCLE_PROJECT_REPONAME = process.env.CIRCLE_PROJECT_REPONAME;
const CI_PULL_REQUEST = process.env.CI_PULL_REQUEST;

const USE_SSH = process.env.USE_SSH;

let remoteBranch;
if (USE_SSH === "true") {
  remoteBranch = `git@github.com:${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}.git`;
} else {
  remoteBranch = `https://${GIT_USER}@github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}.git`;
}

// build static html files, then push to gh-pages branch of specified repo

if (!shell.which("git")) {
  shell.echo("Sorry, this script requires git");
  shell.exit(1);
}

if (CI_PULL_REQUEST) {
  shell.echo("Skipping deploy on a pull request");
  shell.exit(0);
}

if (CIRCLE_BRANCH === "gh-pages") {
  shell.echo("Cannot deploy from a gh-pages branch. Only to it");
  shell.exit(1);
}

if (shell.exec(`node ${__dirname}/build-files.js`).code) {
  shell.echo("Error: generating html failed");
  shell.exit(1);
}

shell.cd(process.cwd());
shell.cd("build");

if (
  shell.exec(`git clone ${remoteBranch} ${CIRCLE_PROJECT_REPONAME}-gh-pages`)
    .code !== 0
) {
  shell.echo("Error: git clone failed");
  shell.exit(1);
}

shell.cd(`${CIRCLE_PROJECT_REPONAME}-gh-pages`);

if (shell.exec("git checkout origin/gh-pages").code !== 0) {
  if (shell.exec("git checkout --orphan gh-pages").code !== 0) {
    shell.echo("Error: Git checkout gh-pages failed");
    shell.exit(1);
  }
} else {
  if (
    shell.exec("git checkout -b gh-pages").code +
      shell.exec("git branch --set-upstream-to=origin/gh-pages").code !==
    0
  ) {
    shell.echo("Error: Git checkout gh-pages failed");
    shell.exit(1);
  }
}

shell.exec("git rm -rf .");

shell.cd("../..");

shell.cp(
  "-R",
  `build/${CIRCLE_PROJECT_REPONAME}/*`,
  `build/${CIRCLE_PROJECT_REPONAME}-gh-pages/`
);
shell.cd(`build/${CIRCLE_PROJECT_REPONAME}-gh-pages`);

const currentCommit = shell.exec('git rev-parse HEAD').stdout.trim();

shell.exec("git add --all");
shell.exec(`git commit -m "Deploy website" -m "Deploy website version based on ${currentCommit}"`);
if (shell.exec("git push origin gh-pages").code !== 0) {
  shell.echo("Error: Git push failed");
  shell.exit(1);
} else {
  shell.echo(
    `Website is live at: https://${CIRCLE_PROJECT_USERNAME}.github.io/${CIRCLE_PROJECT_REPONAME}/`
  );
  shell.exit(0);
}
