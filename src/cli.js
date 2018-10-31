#!/usr/bin/env node

const fs = require("fs");
const Rails = require("./rails");

const [, , ...args] = process.argv;
const dir = process.cwd();
const cmd = args[0];

// todo: isolate all this behind a function for checks in CLI etc or create CLI module
const npmVersion = "0.2.0";
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
const actionNames = [
  "create",
  "delete",
  "edit",
  "find",
  "index",
  "list",
  "new",
  "show",
  "update"
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
          name: project,
          scripts: {
            start: "./node_modules/.bin/nrx start"
          },
          dependencies: {
            "rails-nodejs": `${npmVersion}`
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
} else if (cmd === "server") {
  const server = Rails.Server();

  server.start();
} else if (cmd === "generate" && args[1] === "controller") {
  const name = args[2];
  const action = args[3];

  if (!name) {
    console.error(`Generating a controller requires a controller name`);
    process.exit(1);
  } else if (name && fs.existsSync(`${dir}/app/controllers/${name}`)) {
    console.error(
      `Controller ${name} already exists. Did you mean to create an action instead?`
    );
    process.exit(1);
  } else if (name && fs.existsSync(`${dir}/app/views/${name}`)) {
    console.error(
      `View ${name} already exists. Did you mean to create an action instead?`
    );
    process.exit(1);
  } else if (action && actionNames.indexOf(action) === -1) {
    console.error(`Action ${action} is not a valid action name.`);
    process.exit(1);
  }

  fs.mkdirSync(`${dir}/app/controllers/${name}`);
  fs.mkdirSync(`${dir}/app/views/${name}`);

  if (action) {
    fs.writeFileSync(
      `${dir}/app/controllers/${name}/${action}.action.js`,
      `module.exports = function(req, res) { throw new Error('Not implemented'); }`,
      "utf8"
    );
  }

  if (action && ["index", "new", "show", "edit"].indexOf(action) !== -1) {
    fs.writeFileSync(
      `${dir}/app/views/${name}/${action}.html.ejs`,
      `<h1>${name}#${action}</h1>\n<p>Find me in app/views/${name}/${action}.html.ejs</p>`,
      "utf8"
    );
  }
} else {
  console.error(`Unknown command ${cmd} and args phrase`);
  process.exit(1);
}
