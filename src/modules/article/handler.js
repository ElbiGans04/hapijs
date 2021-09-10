const fs = require("fs");
const fsPromise = require("fs/promises");
const path = require("path");
const pathImages = path.resolve(process.cwd(), "public/images");

module.exports = {
  get: async (request, h) => {
    try {
      const { articleID } = request.params;

      const query = articleID
        ? "SELECT * FROM article WHERE article_id = $1"
        : "SELECT * FROM article";

      const result = await request.systemDb.query(query, articleID);

      // get images
      const resultImages = await request.systemDb.query(
        `SELECT image_id, src, article_id FROM imagesArticle`
      );

      result.forEach((value) => {
        value.images = [];
        resultImages.forEach((image) => {
          if (image["article_id"] === value["article_id"]) {
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
        title,
        description,
        slug,
        images = [],
      } = request.payload ? request.payload : {};

      // Jika tidak lengkap
      if (!title || !description || !slug)
        return h.response({ error: { title: "incomplete field" } }).code(400);

      // handle image upload
      const imagesName = await Promise.all(handleImages(images));

      // Tambahkan Article
      await request.systemDb.query(
        `INSERT INTO article (title, description, slug) VALUES ($1, $2, $3)`,
        [title, description, slug]
      );

      // Dapatkan id dari article yang baru dimasukan
      const { max: lastID } = (
        await request.systemDb.query(`SELECT MAX(article_id) from article`)
      )[0];

      // Masukan image ke table imagesArticle
      for (let imageName of imagesName) {
        const { fileName } = imageName;

        await request.systemDb.query(
          `INSERT INTO imagesArticle (src, article_id) VALUES ($1, $2)`,
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
      const { articleID } = request.params;
      const {
        title,
        description,
        slug,
        images = [],
      } = request.payload ? request.payload : {};

      // Jika tidak lengkap
      if (!title || !description || !slug)
        return h.response({ error: { title: "incomplete field" } }).code(400);

      // Check Jika article tertentu tidak ada
      const checkArticle = await request.systemDb.oneOrNone(
        `SELECT title FROM article WHERE article_id = $1`,
        articleID
      );

      if (!checkArticle)
        return h.response({ error: { title: "article not found" } }).code(404);

      // Dapatkan daftar dari gambar yang terkait
      const oldImages = await request.systemDb.query(
        `SELECT src FROM imagesArticle WHERE article_id = $1`,
        articleID
      );

      // Delete image lama
      for (let { src } of oldImages) {
        await fsPromise.unlink(`${pathImages}/${src}`);
      }

      // delete juga dari database
      await request.systemDb.query(
        `DELETE FROM imagesArticle WHERE article_id = $1`,
        articleID
      );

      // handle image agar tertulis didirectory
      const imagesName = await Promise.all(handleImages(images));

      // Ubah Product
      await request.systemDb.query(
        `UPDATE article SET title = $1, description = $2, slug = $3 WHERE article_id = $4`,
        [title, description, slug, articleID]
      );

      // masukan kembali image baru
      // Masukan image ke table imagesArticle
      for (let imageName of imagesName) {
        const { fileName } = imageName;

        await request.systemDb.query(
          `INSERT INTO imagesArticle (src, article_id) VALUES ($1, $2)`,
          [fileName, articleID]
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
      const { articleID } = request.params;

      // Jika hapus semua
      if (!articleID) {
        // Dapatkan daftar dari gambar yang terkait
        const oldImages = await request.systemDb.query(
          `SELECT src FROM imagesArticle`
        );

        // Delete image lama
        for (let { src } of oldImages) {
          await fsPromise.unlink(`${pathImages}/${src}`);
        }
        await request.systemDb.query(`DELETE FROM imagesArticle`);
        await request.systemDb.query(`DELETE FROM article`);
        return h.response({ message: "success" });
      }

      // Jika belum terdaptar
      const checkArticle = await request.systemDb.oneOrNone(
        `SELECT title FROM article WHERE article_id = $1`,
        articleID
      );

      if (!checkArticle) {
        return h.response({ message: "article is not found" }).code(404);
      }

      // Dapatkan daftar dari gambar yang terkait
      const oldImages = await request.systemDb.query(
        `SELECT src FROM imagesArticle WHERE article_id = $1`,
        articleID
      );

      // Delete image lama
      for (let { src } of oldImages) {
        await fsPromise.unlink(`${pathImages}/${src}`);
      }

      // delete juga dari database
      await request.systemDb.query(
        `DELETE FROM imagesArticle WHERE article_id = $1`,
        articleID
      );

      await request.systemDb.query(
        `DELETE FROM article WHERE article_id = $1`,
        articleID
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
