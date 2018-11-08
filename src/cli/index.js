#!/usr/bin/env node

const Rails = require("../core");

const [, , ...args] = process.argv;
const dir = process.cwd();
const cmd = args[0];

const cli = Rails.CLI();

if (cmd === "new") {
  try {
    cli.newProject(args[1], dir);
  } catch (ex) {
    console.error(`Error creating new project: ${ex.message}`);
    process.exit(1);
  }
} else if (cmd === "server") {
  try {
    const server = Rails.Server();

    cli.loadConfig();
    cli.loadControllers();
    server.start();
  } catch (ex) {
    console.error(`Error running rails server: ${ex.message}`);
    process.exit(1);
  }
} else if (cmd === "generate" && args[1] === "controller") {
  try {
    const name = args[2];
    const action = args[3];

    cli.generateController(dir, name, action);
  } catch (ex) {
    console.error(`Error creating a controller: ${ex.message}`);
    process.exit(1);
  }
} else if (cmd === "generate" && args[1] === "model") {
  try {
    const model = args[2];
    const attrs = args.slice(3).map(attr => {
      const pair = attr.split(":");
      return {
        name: pair[0],
        type: pair[1]
      };
    });

    cli.generateModel(dir, model, attrs);
  } catch (ex) {
    console.error(`Error creating a model: ${ex.message}`);
    process.exit(1);
  }
} else {
  console.error(`Unknown command ${cmd} and args phrase`);
  process.exit(1);
}
