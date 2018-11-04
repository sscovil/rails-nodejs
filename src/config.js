'use strict';

module.exports = {
  actionNames = [
    "create",
    "delete",
    "edit",
    "find",
    "index",
    "list",
    "new",
    "show",
    "update"
  ],
  seedDirectories = [
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
  ],
  versions: {
    ejs: "2.6.1",
    npm: "0.3.0"
  },
  viewActionNames = ["index", "new", "show", "edit"]
};