#!/usr/bin/env node

const fs = require("fs");

const [, , ...args] = process.argv;
const dir = process.cwd();
const cmd = args[0];
const seedDirectories = [
  "app",
  "app/assets",
  "app/assets/images",
  "app/assets/fonts",
  "app/assets/javascripts",
  "app/assets/stylesheets",
  "app/controllers",
  "app/helpers",
  "app/jobs",
  "app/mailers",
  "app/models",
  "app/views",
  "app/views/layouts",
  "bin",
  "config",
  "db",
  "lib",
  "logs",
  "public",
  "test",
  "test/controllers",
  "test/fixtures",
  "test/integration",
  "test/jobs",
  "test/mailers",
  "test/models",
  "tmp"
];

if (cmd === "new") {
  try {
    const project = args[1];
    const projectDirectory = `${dir}/${project}`;

    if (!project) {
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
          bin: {
            nrx: "./bin/cli.js"
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
    for (let i = 0; i < seedDirectories.length; i++) {
      fs.mkdirSync(`${projectDirectory}/${seedDirectories[i]}`);
    }
  } catch (ex) {
    console.error(ex.message);
    process.exit(1);
  }
}
