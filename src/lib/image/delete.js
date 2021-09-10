import { pgSysDb } from "../db/db";
import fsPromise from "fs/promises";
const path = require("path");
const pathImages = path.resolve(process.cwd(), "public/images");

async function deleteImage(query, id) {
  // Dapatkan daftar dari gambar yang terkait
  const oldImages = await pgSysDb.query(
    `SELECT src FROM ${query}`,
    id
  );

  // Delete image lama
  for (let { src } of oldImages) {
    await fsPromise.unlink(`${pathImages}/${src}`);
  }

  // delete juga dari database
  await pgSysDb.query(
    `DELETE FROM ${query}`,
    id
  );
}

export default deleteImage;
