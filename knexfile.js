const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    client: "postgresql",
    connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'migrations',
        directory: './src/migrations'
    },
    seeds: {
        directory: './src/seeds'
    }
}