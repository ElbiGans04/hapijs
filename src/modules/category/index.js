import handler from './handler';
const register = {
    name: 'category-handler',
    version: "1.0",
    async register (server) {
        server.route([
            {
                path: '/category/{categoryID?}',
                method: 'GET',
                options: handler.getCategory
            },
            {
                path: '/category',
                method: 'POST',
                options: handler.postCategory
            },
            {
                path: '/category/{categoryID}',
                method: 'PUT',
                options: handler.putCategory
            },
            {
                path: '/category/{categoryID}',
                method: 'DELETE',
                options: handler.deleteCategory
            },
        ])
    }
}

export default register