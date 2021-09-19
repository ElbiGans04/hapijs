const register = {
    name: "route-plugin",
    version: "1.0",
    register: async (server, options) => {
      const addAuth = (route) => {
        if (route.config) {
          route.config.auth = "jwt";
        } else {
          route.config = {
            auth: "jwt",
          };
        }
      };
  
      const privateRoute = (options) => {
        if (Array.isArray(options)) {
          for (const route of options) {
            addAuth(route);
          }
        } else {
          addAuth(options);
        }
  
        this.route(options);
      };
  
      server.decorate("server", "privateRoute", privateRoute);
    },
  };
  
  export default register;