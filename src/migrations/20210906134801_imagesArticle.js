exports.up = function(knex) {
    return knex .raw(`
    CREATE TABLE IF NOT EXISTS imagesArticle (
        image_id serial primary key NOT NULL,
        src varchar NOT NULL,
        article_id int FOREIGN KEY REFERENCES article(article_id),
        created_at timestamp without time zone default (now() at time zone 'Asia/Jakarta')
    )
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw('DROP TABLE IF EXISTS imagesArticle')
  };