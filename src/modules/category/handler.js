module.exports = {
  get: async (request, h) => {
    const { categoryID } = request.params;

    const query = categoryID ? 'SELECT * FROM category WHERE category_id = $1' : 'SELECT * FROM category';

    const result = (await request.systemDb.query(query, categoryID));

    return h.response({ result });
  },
  post: async (request, h) => {
    const { name } = request.payload ? request.payload : {};

    // Jika tidak mengirim nama
    if (!name)
      return h
        .response({ error: { title: "field name not present" } })
        .code(400);

    // Jika sudah terdaptar
    const checkUser = await request.systemDb.oneOrNone(
      `SELECT name FROM category WHERE name = $1`,
      name
    );
    if (checkUser) {
      return h.response({ message: "category is already" }).code(400);
    }

    // Tambahkan
    await request.systemDb.query(
      `INSERT INTO category (name) VALUES ($1)`,
      name
    );
    return h.response({ message: "success" }).code(201);
  },
  put: async (request, h) => {
    const { categoryID } = request.params;
    const { name } = request.payload ? request.payload : {};

    // Jika tidak mengirim nama
    if (!name)
      return h
        .response({ error: { title: "field name not present" } })
        .code(400);

    // Jika belum terdaptar
    const checkUser = await request.systemDb.oneOrNone(
      `SELECT name FROM category WHERE category_id = $1`,
      categoryID
    );

    if (!checkUser) {
      return h.response({ message: "category is not found" }).code(404);
    }

    await request.systemDb.query(
      `UPDATE category SET name = $<name> WHERE category_id = $<categoryID>`,
      { name, categoryID }
    );
    return h.response({ message: "success" }).code(200);
  },
  delete: async (request, h) => {
    const { categoryID } = request.params;

    // Jika belum terdaptar
    const checkUser = await request.systemDb.oneOrNone(
      `SELECT name FROM category WHERE category_id = $1`,
      categoryID
    );

    if (!checkUser) {
      return h.response({ message: "category is not found" }).code(404);
    }
    await request.systemDb.query(
      `DELETE FROM category WHERE category_id = $1`,
      categoryID
    );
    
    return h.response({ message: "success" }).code(200);
  },
};
