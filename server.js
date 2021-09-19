import hapijs from '@hapi/hapi'
import dotenv from 'dotenv'
import plugin from './plugin'


dotenv.config();

const initServer = async () => {
    const server = hapijs.Server({
        port: process.env.SERVER_PORT || 3000,
        host: 'localhost',
        routes: {
            payload : {
                maxBytes: 20971520
            }
        }
    });

    
    await server.register({
        plugin
    })
  
    return server;
};


const runServer = async () => {
    try {
        const server = await initServer();
        await server.start();
        console.log(`Server already running on ${process.env.SERVER_PORT || 3000}`)
    } catch (err) {
        console.log(err);
        return err;
    }   
}

runServer()