import handler from "./handler";
const register = {
  name: "products-handler",
  version: "1.0",
  async register(server) {
    server.route([
      {
        path: "/products/{productID?}",
        method: "GET",
        handler: handler.get,
      },
      {
        path: "/products",
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
        path: "/products/{productID}",
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
        path: "/products/{productID}",
        method: "DELETE",
        handler: handler.delete,
      },
    ]);
  },
};

export default register;
