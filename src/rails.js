"use strict";

const http = require("http");

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
