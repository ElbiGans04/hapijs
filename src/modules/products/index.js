import handler from "./handler";
const register = {
  name: "products-handler",
  version: "1.0",
  async register(server) {
    server.route([
      {
        path: "/products/{productID?}",
        method: "GET",
        config: handler.getProduct,
      },
      {
        path: "/products",
        method: "POST",
        options: handler.postProduct,
      },
      {
        path: "/products/{productID}",
        method: "PUT",
        options: handler.putProduct,
      },
      {
        path: "/products/{productID?}",
        method: "DELETE",
        options: handler.deleteProduct,
      },
    ]);
  },
};

export default register;
