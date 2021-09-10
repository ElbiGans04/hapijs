import saveToDb from './add'
import deleteImage from './delete'

module.exports = {
  pkg: require("../../../package.json"),
  register: async (server) => {
    server.decorate("request", "saveToDb", saveToDb);
    server.decorate("request", "deleteFromDb", deleteImage);
  },
};
