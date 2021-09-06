import { pgSysDb } from './db'

let register = (server, options) => {
    server.decorate("request", "systemDb", pgSysDb)
}

register = {
    name: 'request-plugins',
    version: "1.0",
    register: register
}

export default register