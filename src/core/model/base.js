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

  static async find(id) {
    // todo: get column definitions and make sure id is of matching type
    const name = this.name;
    const Model = require(`${process.cwd()}/app/models/${name}`);
    const table = `${name.toLowerCase()}s`;

    try {
      const row = await db
        .connection()
        .select()
        .from(table)
        .where("id", id)
        .first()
        .catch(err => {
          console.log(`Error caught: ${err.message}`);
        });

      if (!row) {
        return null;
      }

      const cases = Object.keys(row).map(k => {
        return {
          snake: k,
          camel: k
            .split("_")
            .map(
              (v, i) => (i > 0 ? `${v[0].toUpperCase()}${v.substring(1)}` : v)
            )
            .join("")
        };
      });
      const attrs = Object.keys(row).reduce((acc, curr) => {
        const validColumn = cases.filter(c => c.snake === curr);

        if (validColumn.length) {
          acc[validColumn[0].camel] = row[curr];
        }

        return acc;
      }, {});

      return new Model(attrs);
    } catch (ex) {
      console.log(`Exception in ${name}.find :: ${ex.message}`);
      return null;
    }
  }

  static async findBy() {
    throw new Error("Not Implemented");
  }

  static async first() {
    throw new Error("Not Implemented");
  }

  async save() {
    const name = this.constructor.name;
    const Model = require(`${process.cwd()}/app/models/${name}`);
    const table = `${name.toLowerCase()}s`;

    const columns = await db
      .connection()
      .table(table)
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
      await db
        .connection()
        .insert(toSave)
        .into(table);

      return true;
    } catch (ex) {
      console.log(`Error in ${name}.save :: ${ex.message}`);
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
