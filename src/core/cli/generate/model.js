"use strict";

const fs = require("fs");

module.exports = async function(dir, name, attrs) {
  const resource = `${name.toLowerCase()}s`;

  // todo: verify model name is singular and uppercased
  // todo: verify all attrs are of supported type

  if (!fs.existsSync(`${dir}/db/migrations`)) {
    fs.mkdirSync(`${dir}/db/migrations`);
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now
    .getMonth()
    .toString()
    .padStart(2, "0");
  const day = now
    .getDate()
    .toString()
    .padStart(2, "0");
  const hours = now
    .getHours()
    .toString()
    .padStart(2, "0");
  const minutes = now
    .getMinutes()
    .toString()
    .padStart(2, "0");
  const seconds = now
    .getSeconds()
    .toString()
    .padStart(2, "0");
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const migrationFile = `${dir}/db/migrations/${timestamp}_create_${resource}.js`;
  const modelFile = `${dir}/app/models/${name}.js`;

  if (fs.existsSync(migrationFile)) {
    throw new Error(
      `Cannot create migration ${migrationFile} since it already exists.`
    );
  }

  if (fs.existsSync(modelFile)) {
    throw new Error(
      `Cannot create migration ${modelFile} since it already exists.`
    );
  }

  fs.writeFileSync(
    migrationFile,
    `
    exports.up = async function(knex) {
      await knex.schema.dropTableIfExists('${resource}');
      await knex.schema.createTable('${resource}', (table) => {
        table.uuid('id').primary();
        ${attrs.reduce((acc, curr) => {
          acc += `table.${curr.type}('${curr.name}');\n`;

          return acc;
        }, "")}
        table.timestamps(true, true);
      });
    };

    exports.down = async function(knex) {
      await knex.schema.dropTableIfExists('${resource}');
    };
    `,
    "utf8"
  );

  fs.writeFileSync(
    modelFile,
    `
    const db = require('../../db');
    const Rails = require('rails-nodejs');
    const ActiveRecord = Rails.Model.ActiveRecord;

    module.exports = class ${name} extends ActiveRecord {
      constructor(attrs) {
        super(attrs);
      }
    };
    `,
    "utf8"
  );
};
