const db = require(`${process.cwd()}/db`);

module.exports = {
  connection: function() {
    return db;
  }
};
