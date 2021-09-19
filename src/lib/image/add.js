import { pgSysDb } from '../db'
import fs from 'fs'

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

async function saveToDb(images, tableName, column ,lastId) {
  const imagesName = await Promise.all(handleImages(images))
  // Masukan image ke table imagesArticle
  for (let imageName of imagesName) {
    const { fileName } = imageName;

    await pgSysDb.query(
      `INSERT INTO ${tableName} (src, ${column}) VALUES ($1, $2)`,
      [fileName, lastId]
    );
  }
}

export default saveToDb