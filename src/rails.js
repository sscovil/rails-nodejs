"use strict";

const fs = require("fs");
const http = require("http");

let routes = {};
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

function _loadControllers() {
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

    const actions = fs.readdirSync(`${dir}/app/controllers/${controllers[i]}`);

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
          fn: require(`${dir}/app/controllers/${controllers[i]}/find.action.js`)
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
          fn: require(`${dir}/app/controllers/${controllers[i]}/list.action.js`)
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
          fn: require(`${dir}/app/controllers/${controllers[i]}/show.action.js`)
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

function Server() {
  const port = 3000;
  const instance = http.createServer(handler);

  let started = false;

  function handler(req, res) {
    console.log(`Incoming request to ${req.url}`);

    res.writeHead(200);
    res.end();
  }

  function start() {
    const start = Date.now();

    if (started) {
      throw new Error("Rails Error: cannot start an already started server");
    }

    _loadControllers();

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
  Server
};
