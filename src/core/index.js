"use strict";

const Config = require("./config");
const fs = require("fs");
const url = require("url");
const uuid = require("uuid");

let projectConfig = {};
let routes = {};

/**
 * Module to isolate some logic behind CLI commands. Allows cli.js to focus on
 * user input parsing
 */
function CLI() {
  /**
   * Loads the project's config directory
   */
  function loadConfig() {
    const dir = process.cwd();

    if (!fs.existsSync(`${dir}/config`)) {
      throw new Error(
        `Cannot locate config in directory ${dir}. Ensure rails was started in the same filepath as your package.json and that config exists.`
      );
    } else if (!fs.existsSync(`${dir}/config/index.js`)) {
      throw new Error(
        `Cannot locate config/index.js in directory ${dir}. Ensure rails was started in the same filepath as your package.json and that config/index.js exists.`
      );
    }

    projectConfig = require(`${dir}/config`);
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
          Config.actionNames.indexOf(action[0]) === -1 ||
          !fs
            .lstatSync(`${dir}/app/controllers/${controllers[i]}/${actions[j]}`)
            .isFile()
        ) {
          throw new Error(
            `Action ${action[0]} for controller ${
              controllers[i]
            } is not of the supported format.`
          );
        }

        // todo: maybe extract these to independent functions and a switch?
        if (action[0] === "create") {
          routes[controllers[i]].handlers.push({
            verb: "POST",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/create.action.js`)
          });
        } else if (action[0] === "delete") {
          routes[controllers[i]][":id"].handlers.push({
            verb: "DELETE",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/delete.action.js`)
          });
        } else if (action[0] === "edit") {
          routes[controllers[i]][":id"]["edit"] = {
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
          routes[controllers[i]][":id"].handlers.push({
            verb: "GET",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/find.action.js`)
          });
        } else if (action[0] === "index") {
          routes[controllers[i]].handlers.push({
            verb: "GET",
            accepts: "application/html",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/index.action.js`)
          });
        } else if (action[0] === "list") {
          routes[controllers[i]].handlers.push({
            verb: "GET",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/list.action.js`)
          });
        } else if (action[0] === "new") {
          routes[controllers[i]]["edit"] = {
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
          routes[controllers[i]][":id"].handlers.push({
            verb: "GET",
            accepts: "application/html",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/show.action.js`)
          });
        } else if (action[0] === "update") {
          routes[controllers[i]][":id"].handlers.push({
            verb: "PUT",
            accepts: "application/json",
            fn: require(`${dir}/app/controllers/${
              controllers[i]
            }/update.action.js`)
          });
        } else {
          throw new Error(`action ${action[0]} not supported in Rails`);
        }
      }
    }
  }

  return {
    generateController: require("./cli/generate/controller"),
    loadConfig,
    loadControllers,
    newProject: require("./cli/new.js")
  };
}

/**
 * Routing incoming http requests to their appropriate controller actions
 */
function Router() {
  function incomingRequest(req, res) {
    console.log(`Incoming request to ${req.url}`);

    req.method = req.method.toUpperCase(); // normalize the http method
    req.id = uuid.v4(); // unique id for each http request

    const browserRequest = req.headers.accept.indexOf("html") !== -1;
    const apiRequest = req.headers.accept.indexOf("json") !== -1;
    const requestURL = url.parse(req.url).pathname;

    if (
      requestURL === "/" &&
      Object.keys(routes).length === 0 &&
      !projectConfig.routes.root.length
    ) {
      res.writeHead(200, {
        "Content-Length": Buffer.byteLength(Config.templates.welcome),
        "Content-Type": "text/html"
      });
      return res.end(Config.templates.welcome);
    }

    if (requestURL === "/" && !projectConfig.routes.root.length) {
      res.writeHead(200, {
        "Content-Length": Buffer.byteLength(Config.templates.welcome),
        "Content-Type": "text/html"
      });
      return res.end(Config.templates.welcome);
    } else if (requestURL === "/" && projectConfig.routes.root.length) {
      req.url = projectConfig.routes.root; // todo: this is gonna lose the query etc
    }

    const splitRoute = req.url.split("/");

    splitRoute.shift();

    const controllerParam = splitRoute[0];

    if (!routes[controllerParam] && apiRequest) {
      // todo: render a Routing Error page instead with better error messaging
      res.writeHead(404);
      return res.end();
    } else if (!routes[controllerParam] && browserRequest) {
      const error = Config.templates.errors.routing(
        `Routing Error`,
        `No route matches [${req.method}] "${requestURL}"`
      );
      res.writeHead(200, {
        "Content-Length": Buffer.byteLength(error),
        "Content-Type": "text/html"
      });
      res.end(error);
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
    let actionFunction;

    try {
      actionFunction = require(`${dir}/app/controllers/${controllerParam}/${action}.action.js`);

      if (typeof actionFunction !== "function") {
        throw new Error(
          `Typeof ${dir}/app/controllers/${controllerParam}/${action}.action.js is not a function`
        );
      }
    } catch (ex) {
      const error = Config.templates.errors.routing(
        `Routing Error`,
        `No route matches [${req.method}] "${requestURL}"`
      );
      res.writeHead(200, {
        "Content-Length": Buffer.byteLength(error),
        "Content-Type": "text/html"
      });
      return res.end(error);
    }

    if (typeof actionFunction !== "function") {
      res.writeHead(204);
      return res.end();
    }

    res.send = require("./router/send.js").bind(res);
    res.render = browserRequest
      ? function(data) {
          require("./router/render").call(
            this,
            dir,
            controllerParam,
            action,
            data
          );
        }.bind(res)
      : null;

    /**
     * Stream from Buffer and attach as `body` property to request
     */
    function parseBody(req, res, cb) {
      if (["POST", "PUT"].indexOf(req.method) === -1) {
        return cb(req, res);
      }

      var body = "";

      req.on("data", function(data) {
        body += data;

        if (body.length > 1e6) {
          res.send(400);
        }
      });

      req.on("end", () => {
        try {
          req.body = JSON.parse(body);

          cb(req, res);
        } catch (ex) {
          res.send(400);
        }
      });
    }

    return parseBody(req, res, actionFunction);
  }

  return {
    incomingRequest
  };
}

/**
 * Module to create a Rails server instance to handle incoming http requests
 */
function Server() {
  const router = new Router();

  function start() {
    require("./server/start.js")(router.incomingRequest);
  }

  return {
    start
  };
}

module.exports = {
  CLI,
  Server
};
