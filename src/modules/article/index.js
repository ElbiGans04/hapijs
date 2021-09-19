import handler from "./handler";
const register = {
  name: "article-handler",
  version: "1.0",
  async register(server) {
    server.route([
      {
        path: "/article/{articleID?}",
        method: "GET",
        options: handler.getArticle,
      },
      {
        path: "/article",
        method: "POST",
        options: handler.postArticle,
      },
      {
        path: "/article/{articleID}",
        method: "PUT",
        options: handler.putArticle
      },
      {
        path: "/article/{articleID?}",
        method: "DELETE",
        options: handler.deleteArticle
      },
    ]);
  },
};

export default register;
