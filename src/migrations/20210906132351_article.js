exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS article_id  (
        article_id serial primary key NOT NULL,
        title varchar NOT NULL,
        description varchar NOT NULL,
        slug varchar NOT NULL,
        image varchar NOT NULL,
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta')
        )
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXIST users')
  };
  