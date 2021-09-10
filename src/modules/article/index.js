import handler from "./handler";
const register = {
  name: "article-handler",
  version: "1.0",
  async register(server) {
    server.route([
      {
        path: "/article/{articleID?}",
        method: "GET",
        handler: handler.get,
      },
      {
        path: "/article",
        method: "POST",
        options: {
          payload: {
            allow: "multipart/form-data",
            output: "stream",
            parse: true,
            multipart: true,
            maxBytes: 1024 * 1024 * 100,
            timeout: false,
          },
          handler: handler.post,
        },
      },
      {
        path: "/article/{articleID}",
        method: "PUT",
        options: {
          payload: {
            allow: "multipart/form-data",
            output: "stream",
            parse: true,
            multipart: true,
            maxBytes: 1024 * 1024 * 100,
            timeout: false,
          },
          handler: handler.put,
        },
      },
      {
        path: "/article/{articleID?}",
        method: "DELETE",
        handler: handler.delete,
      },
    ]);
  },
};

export default register;
