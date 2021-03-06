exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS products (
        product_id serial primary key NOT NULL,
        name varchar NOT NULL,
        price varchar NOT NULL,
        description varchar NOT NULL,
        category_id int NOT NULL,
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta'),
        FOREIGN KEY (category_id) REFERENCES category(category_id)
    )
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXISTS products')
  };