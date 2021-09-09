import handler from './handler';
const register = {
    name: 'products-handler',
    version: "1.0",
    async register (server) {
        server.route([
            {
                path: '/products/{productID?}',
                method: 'GET',
                handler: handler.get
            },
            {
                path: '/products',
                method: 'POST',
                handler: handler.post
            },
            {
                path: '/products/{productID}',
                method: 'PUT',
                handler: handler.put
            },
            {
                path: '/products/{productID}',
                method: 'DELETE',
                handler: handler.delete
            },
        ])
    }
}

export default register