module.exports = {
  get: async (request, h) => {
    const { productID } = request.params;

    const query = productID
      ? "SELECT * FROM products WHERE product_id = $1"
      : "SELECT * FROM products";

    const result = await request.systemDb.query(query, productID);

    // get category
    const resultCategory = await request.systemDb.query(`SELECT name, category_id FROM category`);

    result.forEach((value) => {
      // value['category_id'] = 
      resultCategory.forEach((category) => {
        if (category['category_id'] === value['category_id']) {
          value['category_id'] = category;
        }
      })
    })

    return h.response({ result });
  },
  post: async (request, h) => {
    const { name, price, description, categoryId } = request.payload
      ? request.payload
      : {};

    // Jika tidak lengkap
    if (!name || !price || !description || !categoryId)
      return h.response({ error: { title: "incomplete field" } }).code(400);

    // Check Jika category tertentu tidak ada
    const checkCategory = await request.systemDb.oneOrNone(
      `SELECT name FROM category WHERE category_id = $1`,
      categoryId
    );

    if (!checkCategory)
      return h.response({ error: { title: "invalid category id" } }).code(404);

    // Tambahkan
    await request.systemDb.query(
      `INSERT INTO products (name, price, description, category_id) VALUES ($1, $2, $3, $4)`,
      [name, price, description, categoryId]
    );

    return h.response({ message: "success" }).code(201);
  },
  put: async (request, h) => {
    try {
      const { productID } = request.params;
      const { name, price, description, categoryId } = request.payload
        ? request.payload
        : {};

      // Jika tidak lengkap
      if (!name || !price || !description || !categoryId)
        return h.response({ error: { title: "incomplete field" } }).code(400);

      // Check Jika category tertentu tidak ada
      const checkCategory = await request.systemDb.oneOrNone(
        `SELECT name FROM category WHERE category_id = $1`,
        categoryId
      );

      if (!checkCategory)
        return h
          .response({ error: { title: "invalid category id" } })
          .code(404);

      // Check Jika product tertentu tidak ada
      const checkProduct = await request.systemDb.oneOrNone(
        `SELECT name FROM products WHERE product_id = $1`,
        productID
      );

      if (!checkProduct)
        return h
          .response({ error: { title: "product not found" } })
          .code(404);

      await request.systemDb.query(
        `UPDATE products SET name = $1, price = $2, description = $3, category_id = $4 WHERE product_id = $5`,
        [name, price, description, categoryId, productID]
      );
    } catch (err) {
      console.log(err);
    }

    return h.response({ message: "success" }).code(200);
  },
  delete: async (request, h) => {
    const { productID } = request.params;

    // Jika belum terdaptar
    const checkProduct = await request.systemDb.oneOrNone(
      `SELECT name FROM products WHERE product_id = $1`,
      productID
    );

    if (!checkProduct) {
      return h.response({ message: "product is not found" }).code(404);
    }
    await request.systemDb.query(
      `DELETE FROM products WHERE product_id = $1`,
      productID
    );

    return h.response({ message: "success" }).code(200);
  },
};
