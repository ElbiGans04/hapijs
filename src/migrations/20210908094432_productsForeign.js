
exports.up = function(knex) {
    return knex .raw(`
    ALTER TABLE products
    ADD category_id int FOREIGN KEY NOT NULL REFERENCES category(category_id); `)
};

exports.down = function(knex) {

};
