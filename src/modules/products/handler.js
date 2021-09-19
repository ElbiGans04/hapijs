class Handler {
  get getProduct() {
    return {
      handler: async (request, h) => {
        try {
          const { productID } = request.params;

          const query = productID
            ? "SELECT * FROM products WHERE product_id = $1"
            : "SELECT * FROM products";

          const result = await request.systemDb.query(query, productID);

          // get category
          const resultCategory = await request.systemDb.query(
            `SELECT name, category_id FROM category`
          );

          // get images
          const resultImages = await request.systemDb.query(
            `SELECT image_id, src, product_id FROM imagesProduct`
          );

          result.forEach((value) => {
            // value['category_id'] =
            resultCategory.forEach((category) => {
              if (category["category_id"] === value["category_id"]) {
                value["category_id"] = category;
              }
            });

            value.images = [];
            resultImages.forEach((image) => {
              if (image["product_id"] === value["product_id"]) {
                value.images.push(image);
              }
            });
          });

          return h.response({ result });
        } catch (err) {
          console.log(err);
          return h.response({ error: err });
        }
      },
    };
  }

  get postProduct() {
    return {
      payload: {
        allow: "multipart/form-data",
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 1024 * 1024 * 100,
        timeout: false,
      },
      handler: async (request, h) => {
        try {
          const {
            name,
            price,
            description,
            categoryId,
            images = [],
          } = request.payload ? request.payload : {};

          // Jika tidak lengkap
          if (!name || !price || !description || !categoryId)
            return h
              .response({ error: { title: "incomplete field" } })
              .code(400);

          // Check Jika category tertentu tidak ada
          const checkCategory = await request.systemDb.oneOrNone(
            `SELECT name FROM category WHERE category_id = $1`,
            categoryId
          );

          if (!checkCategory)
            return h
              .response({ error: { title: "invalid category id" } })
              .code(404);

          // Tambahkan Product
          await request.systemDb.query(
            `INSERT INTO products (name, price, description, category_id) VALUES ($1, $2, $3, $4)`,
            [name, price, description, categoryId]
          );

          // Dapatkan id dari product yang baru dimasukan
          const { max: lastID } = (
            await request.systemDb.query(`SELECT MAX(product_id) from products`)
          )[0];

          // handle image
          await request.saveToDb(images, "imagesProduct", "product_id", lastID);

          return h.response({ message: "success" }).code(201);
        } catch (err) {
          console.log(err);
          return h.response({ error: err });
        }
      },
    };
  }

  get putProduct() {
    return {
      payload: {
        allow: "multipart/form-data",
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 1024 * 1024 * 100,
        timeout: false,
      },
      handler: async (request, h) => {
        try {
          const { productID } = request.params;
          const {
            name,
            price,
            description,
            categoryId,
            images = [],
          } = request.payload ? request.payload : {};

          // Jika tidak lengkap
          if (!name || !price || !description || !categoryId)
            return h
              .response({ error: { title: "incomplete field" } })
              .code(400);

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

          await request.deleteFromDb(
            `imagesProduct WHERE product_id = $1`,
            productID
          );

          // Ubah Product
          await request.systemDb.query(
            `UPDATE products SET name = $1, price = $2, description = $3, category_id = $4 WHERE product_id = $5`,
            [name, price, description, categoryId, productID]
          );

          await request.saveToDb(
            images,
            "imagesProduct",
            "product_id",
            productID
          );

          return h.response({ message: "success" });
        } catch (err) {
          console.log(err);
          return h.response({ error: err });
        }
      },
    };
  }

  get deleteProduct() {
    return {
      handler: async (request, h) => {
        try {
          const { productID } = request.params;

          if (!productID) {
            await request.deleteFromDb(`imagesProduct`);
            await request.systemDb.query("DELETE FROM products");
            return h.response({ message: "success" }).code(200);
          }

          // Jika belum terdaptar
          const checkProduct = await request.systemDb.oneOrNone(
            `SELECT name FROM products WHERE product_id = $1`,
            productID
          );

          if (!checkProduct) {
            return h.response({ message: "product is not found" }).code(404);
          }

          await request.deleteFromDb(
            `imagesProduct WHERE product_id = $1`,
            productID
          );

          await request.systemDb.query(
            `DELETE FROM products WHERE product_id = $1`,
            productID
          );

          return h.response({ message: "success" }).code(200);
        } catch (err) {
          console.log(err);
          return h.response({ error: err });
        }
      },
    };
  }
}


export default new Handler