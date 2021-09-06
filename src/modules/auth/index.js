import AuthHandler from './auth-handler'

const register = {
    name: 'auth-handler',
    version: "1.0",
    async register (server) {
        server.route([
            {
                path: '/register',
                method: 'POST',
                config: AuthHandler.registerUser
            }
        ])
    }
}

export default register