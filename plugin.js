module.exports = {
    pkg: require('./package.json'),
    register: async (server, options) => {
        server.route({
            method: 'POST',
            path: '/',
            handler: (request, h) => {
                console.log(request.payload)
                return 'hello'
            }
        });
    }
}