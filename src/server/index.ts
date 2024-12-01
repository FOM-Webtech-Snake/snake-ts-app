import {createServer} from "http";
import {Server as SocketIOServer} from 'socket.io'
import dotenv from 'dotenv';
import app from "./server";
import configureServerSocket from "./sockets/configureServerSocket";
import {getLogger} from "../shared/config/LogConfig";
import customParser from "socket.io-msgpack-parser";

const log = getLogger("server.index");

// load environment variables
dotenv.config();

// set the port from the .env file or use 3000 as a fallback
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {parser: customParser});

// init websocket server
configureServerSocket(io);

httpServer.listen(PORT, () => {
    log.info(`Express is listening at port ${PORT}`);
})