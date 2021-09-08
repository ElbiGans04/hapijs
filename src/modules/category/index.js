import handler from './handler';
const register = {
    name: 'category-handler',
    version: "1.0",
    async register (server) {
        server.route([
            {
                path: '/category/{categoryID?}',
                method: 'GET',
                handler: handler.get
            },
            {
                path: '/category',
                method: 'POST',
                handler: handler.post
            },
            {
                path: '/category/{categoryID}',
                method: 'PUT',
                handler: handler.put
            },
            {
                path: '/category/{categoryID}',
                method: 'DELETE',
                handler: handler.delete
            },
        ])
    }
}

export default register