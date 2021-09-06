exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS product (
        product_id serial primary key NOT NULL,
        name varchar NOT NULL,
        price varchar NOT NULL,
        description varchar NOT NULL,
        category_id int FOREIGN KEY NOT NULL REFERENCES category(category_id),
        images int FOREIGN KEY NOT NULL REFERENCES images(image_id),
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta')
    )
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXISTS product')
  };