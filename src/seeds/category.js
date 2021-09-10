
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('category').del()
    .then(function () {
      // Inserts seed entries
      return knex('category').insert([
        {category_id: 1, colName: 'food'},
        {category_id: 2, colName: 'drink'},
      ]);
    });
};
