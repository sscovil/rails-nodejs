"use strict";

const http = require("http");

/**
 * function to start a server instance and route incoming requests
 */
module.exports = function(handler) {
  const port = 3000;
  const start = Date.now();
  const instance = http.createServer(handler);

  instance.listen({ port }, () => {
    console.log(
      `server listening on port ${port}. Startup took ${Date.now() - start}ms`
    );
  });
};
