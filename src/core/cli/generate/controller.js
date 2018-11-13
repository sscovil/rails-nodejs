"use strict";

const Config = require("../../config");
const fs = require("fs");
const { writePrettyFileSync } = require("../../lib/fs");

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

  const isViewAction = Config.viewActionNames.indexOf(action) !== -1;

  if (action && isViewAction) {
    writePrettyFileSync(
      `${root}/app/controllers/${name}/${action}.action.js`,
      `module.exports = async function(req, res) { res.render(); }`
    );
    writePrettyFileSync(
      `${root}/app/views/${name}/${action}.html.ejs`,
      `<div>\n  <h1>${name}#${action}</h1>\n  <p>Find me in app/views/${name}/${action}.html.ejs</p>\n</div>`
    );
  }

  if (action && !isViewAction) {
    writePrettyFileSync(
      `${root}/app/controllers/${name}/${action}.action.js`,
      `module.exports = async function(req, res) { res.send(204); }`
    );
  }
};
