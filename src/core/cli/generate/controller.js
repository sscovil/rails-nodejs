"use strict";

const Config = require("../../config");
const fs = require("fs");

/**
 * Create an empty controller or an optional action with it
 */
module.exports = function(root, name, action) {
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
  } else if (action && Config.actionNames.indexOf(action) === -1) {
    throw new Error(`Action ${action} is not a valid action name.`);
  }

  fs.mkdirSync(`${root}/app/controllers/${name}`);
  fs.mkdirSync(`${root}/app/views/${name}`);

  // todo: implement send function for api
  if (action && Config.viewActionNames.indexOf(action) === -1) {
    fs.writeFileSync(
      `${root}/app/controllers/${name}/${action}.action.js`,
      `module.exports = function(req, res) { res.send(204); }`,
      "utf8"
    );
  } else if (action && Config.viewActionNames.indexOf(action) !== -1) {
    fs.writeFileSync(
      `${root}/app/controllers/${name}/${action}.action.js`,
      `module.exports = function(req, res) { res.render(); }`,
      "utf8"
    );
  }

  if (action && Config.viewActionNames.indexOf(action) !== -1) {
    fs.writeFileSync(
      `${root}/app/views/${name}/${action}.html.ejs`,
      `<h1>${name}#${action}</h1>\n<p>Find me in app/views/${name}/${action}.html.ejs</p>`,
      "utf8"
    );
  }
};
