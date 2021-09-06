exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS category (
        category_id serial primary key NOT NULL,
        name varchar NOT NULL,
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta')
    )
    `)
  };

  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXISTS category')
  };