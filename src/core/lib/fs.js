"use strict";

const fs = require("fs");
const path = require("path");
const prettier = require('prettier');

exports.writePrettyFileSync = (filepath, content, format = "utf8") => {
  let formattedContent;

  const { ext } = path.parse(filepath);

  if (String(ext).toLowerCase() === '.ejs') {
    formattedContent = content; // Prettier does not support .ejs syntax.
  } else {
    formattedContent = prettier.format(content, { filepath });
  }

  fs.writeFileSync(filepath, formattedContent, format);
};
