import {createServer} from "http";
import {Server as SocketIOServer} from 'socket.io'
import dotenv from 'dotenv';
import app from "./server";
import configureServerSocket from "./sockets/socket";
import {GameSession} from "../shared/GameSession";

// load environment variables
dotenv.config();

// set the port from the .env file or use 3000 as a fallback
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

const sessions: Record<string, GameSession> = {};
configureServerSocket(io, sessions);

httpServer.listen(PORT, () => {
    console.log(`Express is listening at port ${PORT}`);
})