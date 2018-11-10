const db = require("../db/index");

module.exports = class ActiveRecord {
  constructor(attrs) {
    var self = this;

    Object.keys(attrs).forEach(k => {
      self[k] = attrs[k];
    });
  }

  getProperty(path) {
    var paths = path.split(".");
    var obj = this.json;
    var current = obj;

    for (var i = 0; i < paths.length; i++) {
      if (_isArraySyntax(paths[i])) {
        var prop = paths[i].split("[")[0];
        var idx = Number(paths[i].split("[")[1].split("]")[0]);

        current = current[prop][idx];
      } else if (current[paths[i]]) {
        current = current[paths[i]];
      } else {
        current = null;
        break;
      }
    }

    return current ? current : null;

    function _isArraySyntax(arg) {
      return arg.indexOf("[") !== -1 && arg.indexOf("]") !== -1;
    }
  }

  static async all() {
    throw new Error("Not Implemented");
  }

  static async create() {
    throw new Error("Not Implemented");
  }

  async destroy() {
    throw new Error("Not Implemented");
  }

  static async destroyAll() {
    throw new Error("Not Implemented");
  }

  static async findBy() {
    throw new Error("Not Implemented");
  }

  static async first() {
    throw new Error("Not Implemented");
  }

  async save() {
    const columns = await db
      .connection()
      .table("articles")
      .columnInfo();

    const cases = Object.keys(columns).map(k => {
      return {
        snake: k,
        camel: k
          .split("_")
          .map((v, i) => (i > 0 ? `${v[0].toUpperCase()}${v.substring(1)}` : v))
          .join("")
      };
    });

    const toSave = Object.keys(this).reduce((acc, curr) => {
      const validColumn = cases.filter(c => c.camel === curr);

      if (validColumn.length) {
        acc[validColumn[0].snake] = this[curr];
      }

      return acc;
    }, {});

    try {
      await db.insert(toSave);

      return true;
    } catch (ex) {
      return false;
    }
  }

  async update() {
    throw new Error("Not Implemented");
  }

  static async updateAll() {
    throw new Error("Not Implemented");
  }

  static async where() {
    throw new Error("Not Implemented");
  }
};
