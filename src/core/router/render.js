"use strict";

const ejs = require("ejs");
const fs = require("fs");

/**
 * Function attached to a response object for rending the view
 *
 * @param {*} data - Local values that are referenced in the EJS embedded code
 */
module.exports = function(dir, controller, action, data) {
  try {
    const template = fs.readFileSync(
      `${dir}/app/views/${controller}/${action}.html.ejs`,
      "utf8"
    );
    const rendered = ejs.render(template, data, {
      views: [`${dir}/app/views`]
    });

    this.writeHead(200, {
      "Content-Length": Buffer.byteLength(rendered),
      "Content-Type": "text/html"
    });
    this.end(rendered);
  } catch (ex) {
    console.error(`Error rendering template: ${ex.message}`);
    this.writeHead(400);
    this.end();
  }
};
