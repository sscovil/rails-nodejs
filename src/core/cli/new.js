"use strict";

const Config = require("../config");
const fs = require("fs");

/**
 * Create a new rails project at the specified directory as the root
 */
module.exports = function(name, root) {
  const projectDirectory = `${root}/${name}`;

  if (!name) {
    throw new Error(`Running the new command requires a project name`);
  } else if (fs.existsSync(projectDirectory)) {
    throw new Error(
      `Unable to create directory ${projectDirectory} because it already exists`
    );
  }

  // root project
  fs.mkdirSync(projectDirectory);

  // todo: create a package-lock.json / shrinkwrap for the project
  fs.writeFileSync(
    `${projectDirectory}/package.json`,
    JSON.stringify(
      {
        name: name,
        scripts: {
          start: "./node_modules/.bin/nrx start"
        },
        dependencies: {
          ejs: Config.versions.ejs,
          "rails-nodejs": Config.versions.npm,
          uuid: Config.versions.uuid
        },
        devDependencies: {
          eslint: Config.versions.eslint,
          "eslint-config-prettier": "3.0.1",
          "eslint-plugin-prettier": "2.6.2",
          prettier: Config.versions.prettier
        }
      },
      null,
      2
    ),
    "utf8"
  );

  // gitignore for files we dont want checked into source control
  fs.writeFileSync(
    `${projectDirectory}/.gitignore`,
    `node_modules\npublic\nlog\ntmp/*\n`,
    "utf8"
  );

  // todo: fill in this content
  fs.writeFileSync(`${projectDirectory}/README.md`, ``, "utf8");

  fs.writeFileSync(`${projectDirectory}/.npmrc`, `save_exact=true\n`, "utf8");
  fs.writeFileSync(`${projectDirectory}/.nvmrc`, `v8.11.0\n`, "utf8");

  // all the application code
  for (let i = 0; i < Config.seedDirectories.length; i++) {
    fs.mkdirSync(`${projectDirectory}/${Config.seedDirectories[i]}`);
  }

  // base config.js file
  const config = JSON.stringify(
    {
      routes: {
        root: "" // special route. must be a stringified path
      }
    },
    null,
    2
  );
  fs.writeFileSync(
    `${projectDirectory}/config/index.js`,
    `module.exports = ${config};`,
    "utf8"
  );

  // editor config
  fs.writeFileSync(
    `${projectDirectory}/.editorconfig`,
    Config.templates.editorConfig,
    "utf8"
  );

  // eslint for node server
  fs.writeFileSync(
    `${projectDirectory}/.eslintrc.json`,
    JSON.stringify(
      {
        env: {
          es6: true,
          node: true
        },
        parserOptions: {
          ecmaVersion: 2017
        },
        extends: ["eslint:recommended"],
        rules: {
          "no-console": ["warn"],
          "no-empty": [
            "error",
            {
              allowEmptyCatch: true
            }
          ]
        }
      },
      null,
      2
    ),
    "utf8"
  );

  // eslint files to ignore
  fs.writeFileSync(
    `${projectDirectory}/.eslintignore`,
    `node_modules\npackage.json\napp/assets\ntmp\npublic\nlogs`,
    "utf8"
  );

  // prettier files to ignore
  fs.writeFileSync(
    `${projectDirectory}/.eslintignore`,
    `node_modules\npackage.json\napp/assets\ntmp\npublic\nlogs`,
    "utf8"
  );
};
