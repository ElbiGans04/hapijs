import dotenv from 'dotenv';
import pgp from 'pg-promise'
import Promise from 'bluebird'

dotenv.config();

const systemDb = {
    client: 'pg',
    connection: {
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      poolSize: 200,
      max: 1000,
      min: 0,
      idleTimeoutMilis: 60000
    },
    pool: {min: 0, max: 1000},
    acquireConnectionTimeout: 10000,
    migrations: {
      tableName: 'migrations'
    }
  }

const pgPromise = pgp({
    promiseLib: Promise,
    async connect(client, dc, useCount) {
        if (useCount === 0 && dc && dc.email) {
            const email = encodeURI(dc.email);
            await client.query(`SET SESSION "app.user" = ${email}`);
        }
    }
});

export const pgSysDb = pgPromise(systemDb.connection)