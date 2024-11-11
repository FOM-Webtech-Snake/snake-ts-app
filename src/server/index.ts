import {createServer} from "http";
import {Server} from 'socket.io'
import dotenv from 'dotenv';
import app from "./server";
import configureServerSocket from "./sockets/socket";

// load environment variables
dotenv.config();

// set the port from the .env file or use 3000 as a fallback
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // TODO Allow connections from any origin for testing; update in production
    }
});

configureServerSocket(io);

httpServer.listen(PORT, () => {
    console.log(`Express is listening at port ${PORT}`);
})