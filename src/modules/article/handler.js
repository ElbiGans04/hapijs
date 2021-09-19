class Handler {
  get getArticle() {
    return {
      handler: async (request, h) => {
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
    };
  }

  get postArticle() {
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
            title,
            description,
            slug,
            images = [],
          } = request.payload ? request.payload : {};

          // Jika tidak lengkap
          if (!title || !description || !slug)
            return h
              .response({ error: { title: "incomplete field" } })
              .code(400);

          // Tambahkan Article
          await request.systemDb.query(
            `INSERT INTO article (title, description, slug) VALUES ($1, $2, $3)`,
            [title, description, slug]
          );

          // Dapatkan id dari article yang baru dimasukan
          const { max: lastID } = (
            await request.systemDb.query(`SELECT MAX(article_id) from article`)
          )[0];

          await request.saveToDb(images, "imagesArticle", "article_id", lastID);

          return h.response({ message: "success" }).code(201);
        } catch (err) {
          console.log(err);
          return h.response({ error: err });
        }
      },
    };
  }

  get putArticle() {
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
            return h
              .response({ error: { title: "article not found" } })
              .code(404);
  
          await request.deleteFromDb(
            `imagesArticle WHERE article_id = $1`,
            articleID
          );
  
          // Ubah Product
          await request.systemDb.query(
            `UPDATE article SET title = $1, description = $2, slug = $3 WHERE article_id = $4`,
            [title, description, slug, articleID]
          );
  
          await request.saveToDb(
            images,
            "imagesArticle",
            "article_id",
            articleID
          );
  
          return h.response({ message: "success" });
        } catch (err) {
          console.log(err);
          return h.response({ error: err });
        }
      }
    }
  }

  get deleteArticle() {
    return {
      handler: async (request, h) => {
        try {
          const { articleID } = request.params;

          // Jika hapus semua
          if (!articleID) {
            await request.deleteFromDb(`imagesArticle`);
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

          await request.deleteFromDb(
            `imagesArticle WHERE article_id = $1`,
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
  }
}


export default new Handler