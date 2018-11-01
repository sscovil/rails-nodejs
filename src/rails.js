"use strict";

const fs = require("fs");
const http = require("http");
const url = require("url");

let routes = {};

// todo: isolate all this behind function calls?
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
const viewActionNames = ["index", "new", "show", "edit"];

/**
 * Module to isolate some logic behind CLI commands. Allows cli.js to focus on
 * user input parsing
 */
function CLI() {
  /**
   * Create an empty controller or an optional action with it
   */
  function generateController(root, name, action) {
    if (!name) {
      throw new Error(`Generating a controller requires a controller name`);
    } else if (name && fs.existsSync(`${root}/app/controllers/${name}`)) {
      throw new Error(
        `Controller ${name} already exists. Did you mean to create an action instead?`
      );
    } else if (name && fs.existsSync(`${root}/app/views/${name}`)) {
      throw new Error(
        `View ${name} already exists. Did you mean to create an action instead?`
      );
    } else if (action && actionNames.indexOf(action) === -1) {
      throw new Error(`Action ${action} is not a valid action name.`);
    }

    fs.mkdirSync(`${root}/app/controllers/${name}`);
    fs.mkdirSync(`${root}/app/views/${name}`);

    if (action) {
      fs.writeFileSync(
        `${root}/app/controllers/${name}/${action}.action.js`,
        `module.exports = function(req, res) { throw new Error('Not implemented'); }`,
        "utf8"
      );
    }

    if (action && viewActionNames.indexOf(action) !== -1) {
      fs.writeFileSync(
        `${root}/app/views/${name}/${action}.html.ejs`,
        `<h1>${name}#${action}</h1>\n<p>Find me in app/views/${name}/${action}.html.ejs</p>`,
        "utf8"
      );
    }
  }

  /**
   * At runtime we parse the app/controllers folder to dynamically build route matching
   * based on defined controllers and actions
   */
  function loadControllers() {
    const dir = process.cwd();

    if (!fs.existsSync(`${dir}/app/controllers`)) {
      throw new Error(
        `Cannot locate app/controllers in directory ${dir}. Ensure rails was started in the same filepath as your package.json and that app/controllers exists.`
      );
      process.exit(1);
    }

    const controllers = fs.readdirSync(`${dir}/app/controllers`);

    for (let i = 0; i < controllers.length; i++) {
      if (
        !fs.lstatSync(`${dir}/app/controllers/${controllers[i]}`).isDirectory()
      ) {
        continue;
      }

      routes[controllers[i]] = {
        handlers: [],
        ":id": {
          handlers: []
        }
      };

      const actions = fs.readdirSync(
        `${dir}/app/controllers/${controllers[i]}`
      );

      for (let j = 0; j < actions.length; j++) {
        const action = actions[j].split(".");

        if (
          action.length !== 3 ||
          action[1] !== "action" ||
          action[2] !== "js" ||
          actionNames.indexOf(action[0]) === -1 ||
          !fs
            .lstatSync(`${dir}/app/controllers/${controllers[i]}/${actions[j]}`)
            .isFile()
        ) {
          throw new Error(
            `Action ${action[0]} for controller ${
              controllers[i]
            } is not of the supported format.`
          );
          process.exit(1);
        }

        // todo: maybe extract these to independent functions and a switch?
        if (action[0] === "create") {
          routes[controllers].handlers.push({
            verb: "POST",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/create.action.js`)
          });
        } else if (action[0] === "delete") {
          routes[controllers][":id"].handlers.push({
            verb: "DELETE",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/delete.action.js`)
          });
        } else if (action[0] === "edit") {
          routes[controllers][":id"]["edit"] = {
            handlers: [
              {
                verb: "GET",
                accepts: "application/html",
                fn: require(`${dir}/app/controllers/${
                  controllers[i]
                }/edit.action.js`)
              }
            ]
          };
        } else if (action[0] === "find") {
          routes[controllers][":id"].handlers.push({
            verb: "GET",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/find.action.js`)
          });
        } else if (action[0] === "index") {
          routes[controllers].handlers.push({
            verb: "GET",
            accepts: "application/html",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/index.action.js`)
          });
        } else if (action[0] === "list") {
          routes[controllers].handlers.push({
            verb: "GET",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/list.action.js`)
          });
        } else if (action[0] === "new") {
          routes[controllers]["edit"] = {
            handlers: [
              {
                verb: "GET",
                accepts: "application/html",
                fn: require(`${dir}/app/controllers/${
                  controllers[i]
                }/new.action.js`)
              }
            ]
          };
        } else if (action[0] === "show") {
          routes[controllers][":id"].handlers.push({
            verb: "GET",
            accepts: "application/html",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/show.action.js`)
          });
        } else if (action[0] === "update") {
          routes[controllers][":id"].handlers.push({
            verb: "PUT",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/update.action.js`)
          });
        } else {
          throw new Error(`action ${action[0]} not supported in Rails`);
          process.exit(1);
        }
      }
    }
  }

  /**
   * Create a new rails project at the specified directory as the root
   */
  function newProject(name, root) {
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
  }

  return {
    generateController,
    loadControllers,
    newProject
  };
}

/**
 * Routing incoming http requests to their appropriate controller actions
 */
function Router() {
  function incomingRequest(req, res) {
    console.log(`Incoming request to ${req.url}`);

    // normalize the http method
    req.method = req.method.toUpperCase();

    const browserRequest = req.headers.accept.indexOf("html") !== -1;
    const apiRequest = req.headers.accept.indexOf("json") !== -1;
    const requestURL = url.parse(req.url).pathname;

    if (requestURL === "/") {
      // todo: handle a root action configuration
      res.writeHead(200);
      return res.end();
    }

    const splitRoute = requestURL.split("/");

    splitRoute.shift();

    const controllerParam = splitRoute[0];

    if (!routes[controllerParam]) {
      // todo: render a 404 page instead with better error messaging
      res.writeHead(404);
      return res.end();
    }

    let action;

    if (req.method === "GET" && splitRoute.length === 1 && browserRequest) {
      action = "index";
    } else if (req.method === "GET" && splitRoute.length === 1 && apiRequest) {
      action = "list";
    } else if (req.method === "POST" && splitRoute.length === 1 && apiRequest) {
      action = "create";
    } else if (
      req.method === "GET" &&
      splitRoute.length === 2 &&
      splitRoute[1] === "new" &&
      browserRequest
    ) {
      action = "new";
    } else if (
      req.method === "GET" &&
      splitRoute.length === 2 &&
      !routes[controllerParam][splitRoute[1]] &&
      routes[controllerParam][":id"] &&
      browserRequest
    ) {
      action = "show";
    } else if (
      req.method === "GET" &&
      splitRoute.length === 2 &&
      !routes[controllerParam][splitRoute[1]] &&
      routes[controllerParam][":id"] &&
      apiRequest
    ) {
      action = "find";
    } else if (
      req.method === "PUT" &&
      splitRoute.length === 2 &&
      !routes[controllerParam][splitRoute[1]] &&
      routes[controllerParam][":id"] &&
      apiRequest
    ) {
      action = "update";
    } else if (
      req.method === "DELETE" &&
      splitRoute.length === 2 &&
      !routes[controllerParam][splitRoute[1]] &&
      routes[controllerParam][":id"] &&
      apiRequest
    ) {
      action = "delete";
    } else if (
      req.method === "GET" &&
      splitRoute.length === 3 &&
      !routes[controllerParam][splitRoute[1]] &&
      routes[controllerParam][":id"] &&
      routes[controllerParam][":id"]["edit"] &&
      browserRequest
    ) {
      action = "edit";
    } else {
      res.writeHead(204);
      return res.end();
    }

    const dir = process.cwd();
    const actionFunction = require(`${dir}/app/controllers/${controllerParam}/${action}.action.js`);

    if (typeof actionFunction !== "function") {
      res.writeHead(204);
      return res.end();
    }

    return actionFunction(req, res);
  }

  return {
    incomingRequest
  };
}

/**
 * Module to create a Rails server instance to handle incoming http requests
 */
function Server() {
  const port = 3000;
  const router = new Router();
  const instance = http.createServer(router.incomingRequest);

  let started = false;

  function start() {
    const start = Date.now();

    if (started) {
      throw new Error("Rails Error: cannot start an already started server");
    }

    instance.listen({ port }, listenerCallback);

    function listenerCallback() {
      started = true;

      console.log(
        `server listening on port ${port}. Startup took ${Date.now() - start}ms`
      );
    }
  }

  return {
    start
  };
}

module.exports = {
  CLI,
  Server
};
