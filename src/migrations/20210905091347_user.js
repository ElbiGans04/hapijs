exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS users (
        user_id serial primary key NOT NULL,
        name varchar NOT NULL,
        email varchar NOT NULL,
        password varchar NOT NULL,
        phone varchar,
        is_admin boolean,
        address text,
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta')
    )
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXISTS users')
  };