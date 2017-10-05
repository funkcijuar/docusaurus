#!/usr/bin/env node

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CWD = process.cwd();
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const chalk = require("chalk");

let feature;

const program = require("commander");
program
  .arguments("[feature]")
  .action(feat => {
    feature = feat;
  })
  .parse(process.argv);

const outerFolder = path.basename(path.dirname(CWD));

// handles cases where feature is "translations", "versions" or neither/not present
if (feature === "translations") {
  // copy files for translations
  const folder = path.join(__dirname, "..", "examples", "translations");
  if (fs.existsSync(CWD + "/../crowdin.yaml")) {
    console.log(
      `${chalk.yellow("crowdin.yaml already exists")} in ${chalk.yellow(
        outerFolder + "/"
      )}. Rename or remove the file to regenerate an example version.\n`
    );
  } else {
    fs.copySync(folder + "/crowdin.yaml", CWD + "/../crowdin.yaml");
    console.log(
      `${chalk.green("Example crowdin.yaml file created")} in ${chalk.yellow(
        outerFolder + "/"
      )}.\n`
    );
  }
  let files = glob.sync(folder + "/**/*");
  files.forEach(file => {
    if (fs.lstatSync(file).isDirectory()) {
      return;
    }
    if (path.basename(file) === "crowdin.yaml") {
      return;
    }
    const filePath = path.resolve(file).split(path.resolve(folder))[1];
    try {
      fs.copySync(file, CWD + filePath, {
        overwrite: false,
        errorOnExist: true
      });
      console.log(
        `${chalk.green(
          "Example " + path.basename(filePath) + " file created"
        )} in ${chalk.yellow(
          "website" + filePath.split(path.basename(filePath))[0]
        )}.\n`
      );
    } catch (e) {
      console.log(
        `${chalk.yellow(
          path.basename(filePath) + " already exists"
        )} in ${chalk.yellow(
          "website" + filePath.split(path.basename(filePath))[0]
        )}. Rename or remove the file to regenerate an example version.\n`
      );
    }
  });
} else if (feature === "versions") {
  // copy files for versions
  const folder = path.join(__dirname, "..", "examples", "versions");
  let files = glob.sync(folder + "/**/*");
  files.forEach(file => {
    if (fs.lstatSync(file).isDirectory()) {
      return;
    }
    const filePath = path.resolve(file).split(path.resolve(folder))[1];
    try {
      fs.copySync(file, CWD + filePath, {
        overwrite: false,
        errorOnExist: true
      });
      console.log(
        `${chalk.green(
          "Example " + path.basename(filePath) + " file created"
        )} in ${chalk.yellow(
          "website" + filePath.split(path.basename(filePath))[0]
        )}.\n`
      );
    } catch (e) {
      console.log(
        `${chalk.yellow(
          path.basename(filePath) + " already exists"
        )} in ${chalk.yellow(
          "website" + filePath.split(path.basename(filePath))[0]
        )}. Rename or remove the file to regenerate an example version.\n`
      );
    }
  });
} else {
  const folder = path.join(__dirname, "..", "examples", "basics");
  // copy docs examples
  if (fs.existsSync(CWD + "/../docs-examples-from-docusaurus")) {
    console.log(
      `${chalk.yellow(
        "Example docs already exist!"
      )} Rename or remove ${chalk.yellow(
        outerFolder + "/docs-examples-from-docusaurus"
      )} to regenerate example docs.\n`
    );
  } else {
    fs.copySync(
      folder + "/docs-examples-from-docusaurus",
      CWD + "/../docs-examples-from-docusaurus"
    );
    console.log(
      `${chalk.green("Example docs created")} in ${chalk.yellow(
        outerFolder + "/docs-examples-from-docusaurus"
      )}! Rename the folder to ${chalk.yellow(
        outerFolder + "/docs"
      )} to see the example docs on your site.\n`
    );
  }
  // copy blog examples
  if (fs.existsSync(CWD + "/blog-examples-from-docusaurus")) {
    console.log(
      `${chalk.yellow(
        "Example blog posts already exist!"
      )} Rename or remove ${chalk.yellow(
        outerFolder + "/website/blog-examples-from-docusaurus"
      )} to regenerate example blog posts.\n`
    );
  } else {
    fs.copySync(
      path.join(folder, "blog-examples-from-docusaurus"),
      path.join(CWD, "blog-examples-from-docusaurus")
    );
    console.log(
      `${chalk.green("Example blog posts created")} in ${chalk.yellow(
        outerFolder + "/website/blog-examples-from-docusaurus"
      )}! Rename the folder to ${chalk.yellow(
        outerFolder + "/website/blog"
      )} to see the example blog posts on your site.\n`
    );
  }
  // copy .gitignore file
  if (fs.existsSync(CWD + "/.gitignore")) {
    console.log(
      `${chalk.yellow(".gitignore already exists")} in ${chalk.yellow(
        "website/"
      )}. Rename or remove the file to regenerate an example version.\n`
    );
  } else {
    fs.copySync(path.join(folder, "gitignore"), path.join(CWD, ".gitignore"));
    console.log(
      `${chalk.green("Example .gitignore file created")} in ${chalk.yellow(
        "website/"
      )}.\n`
    );
  }
  // copy other files
  let files = glob.sync(folder + "/**/*");
  files.forEach(file => {
    if (fs.lstatSync(file).isDirectory()) {
      return;
    }
    const containingFolder = path.basename(path.dirname(file));
    if (
      path.basename(file) === "gitignore" ||
      containingFolder === "blog-examples-from-docusaurus" ||
      containingFolder === "docs-examples-from-docusaurus"
    ) {
      return;
    }
    const filePath = path.resolve(file).split(path.resolve(folder))[1];
    try {
      fs.copySync(file, CWD + filePath, {
        overwrite: false,
        errorOnExist: true
      });
      console.log(
        `${chalk.green(
          "Example " + path.basename(filePath) + " file created"
        )} in ${chalk.yellow(
          "website" + filePath.split(path.basename(filePath))[0]
        )}.\n`
      );
    } catch (e) {
      console.log(
        `${chalk.yellow(
          path.basename(filePath) + " already exists"
        )} in ${chalk.yellow(
          "website" + filePath.split(path.basename(filePath))[0]
        )}. Rename or remove the file to regenerate an example version.\n`
      );
    }
  });
}

// add scripts to package.json file
if (fs.existsSync(CWD + "/package.json")) {
  const packageContent = JSON.parse(
    fs.readFileSync(CWD + "/package.json", "utf8")
  );
  if (!packageContent.scripts) {
    packageContent.scripts = {};
  }
  packageContent.scripts["start"] = "docusaurus-start";
  packageContent.scripts["build"] = "docusaurus-build";
  packageContent.scripts["publish-gh-pages"] = "docusaurus-publish";
  packageContent.scripts["examples"] = "docusaurus-examples";
  packageContent.scripts["write-translations"] =
    "docusaurus-write-translations";
  packageContent.scripts["version"] = "docusaurus-version";
  packageContent.scripts["rename-version"] = "docusaurus-rename-version";
  fs.writeFileSync(
    CWD + "/package.json",
    JSON.stringify(packageContent, null, 2)
  );
  console.log(
    `${chalk.green("Wrote docusaurus scripts to package.json file.")}\n`
  );
}
