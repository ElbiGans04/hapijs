exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS images (
        image_id serial primary key NOT NULL,
        src varchar NOT NULL,
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta')
    )
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXISTS images')
  };