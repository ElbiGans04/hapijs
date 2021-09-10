const fs = require("fs");
const fsPromise = require("fs/promises");
const path = require("path");
const pathImages = path.resolve(process.cwd(), "public/images");

module.exports = {
  get: async (request, h) => {
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
  post: async (request, h) => {
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

      // handle image upload
      const imagesName = await Promise.all(handleImages(images));

      // Tambahkan Product
      await request.systemDb.query(
        `INSERT INTO products (name, price, description, category_id) VALUES ($1, $2, $3, $4)`,
        [name, price, description, categoryId]
      );

      // Dapatkan id dari product yang baru dimasukan
      const { max: lastID } = (
        await request.systemDb.query(`SELECT MAX(product_id) from products`)
      )[0];

      // Masukan image ke table imagesProduct
      for (let imageName of imagesName) {
        const { fileName } = imageName;

        await request.systemDb.query(
          `INSERT INTO imagesProduct (src, product_id) VALUES ($1, $2)`,
          [fileName, lastID]
        );
      }

      return h.response({ message: "success" }).code(201);
    } catch (err) {
      console.log(err);
      return h.response({ error: err });
    }
  },
  put: async (request, h) => {
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
        return h.response({ error: { title: "product not found" } }).code(404);

      // Dapatkan daftar dari gambar yang terkait
      const oldImages = await request.systemDb.query(
        `SELECT src FROM imagesProduct WHERE product_id = $1`,
        productID
      );

      // Delete image lama
      for (let { src } of oldImages) {
        await fsPromise.unlink(`${pathImages}/${src}`);
      }

      // delete juga dari database
      await request.systemDb.query(
        `DELETE FROM imagesProduct WHERE product_id = $1`,
        productID
      );

      // handle image agar tertulis didirectory
      const imagesName = await Promise.all(handleImages(images));

      // Ubah Product
      await request.systemDb.query(
        `UPDATE products SET name = $1, price = $2, description = $3, category_id = $4 WHERE product_id = $5`,
        [name, price, description, categoryId, productID]
      );

      // masukan kembali image baru
      // Masukan image ke table imagesProduct
      for (let imageName of imagesName) {
        const { fileName } = imageName;

        await request.systemDb.query(
          `INSERT INTO imagesProduct (src, product_id) VALUES ($1, $2)`,
          [fileName, productID]
        );
      }

      return h.response({ message: "success" });
    } catch (err) {
      console.log(err);
      return h.response({ error: err });
    }
  },
  delete: async (request, h) => {
    try {
      const { productID } = request.params;

      if (!productID) {
        // Dapatkan daftar dari gambar yang terkait
        const oldImages = await request.systemDb.query(
          `SELECT src FROM imagesProduct`
        );

        // Delete image lama
        for (let { src } of oldImages) {
          await fsPromise.unlink(`${pathImages}/${src}`);
        }
        await request.systemDb.query("DELETE FROM imagesProduct");
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

      // Dapatkan daftar dari gambar yang terkait
      const oldImages = await request.systemDb.query(
        `SELECT src FROM imagesProduct WHERE product_id = $1`,
        productID
      );

      // Delete image lama
      for (let { src } of oldImages) {
        await fsPromise.unlink(`${pathImages}/${src}`);
      }

      // delete juga dari database
      await request.systemDb.query(
        `DELETE FROM imagesProduct WHERE product_id = $1`,
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

function handleImages(read) {
  if (!(read instanceof Array)) read = [read];
  const promiseImages = [];

  read.forEach((value, index) => {
    const promise = new Promise((resolve, reject) => {
      const name = `elbi-${Date.now()}-${Math.round(Math.random() * 10)}.jpg`;
      const writeStream = fs.createWriteStream(
        process.cwd() + `/public/images/${name}`
      );

      writeStream.on("error", (err) => {
        console.log(err);
        reject(err);
      });

      writeStream.on("finish", () => {
        resolve({ message: "success", fileName: name });
      });

      value.pipe(writeStream);
    });

    // masukan kedalam antrian
    promiseImages.push(promise);
  });

  return promiseImages;
}
