import configureClientSocket from "./sockets/socket";
import {io} from "socket.io-client";
import config from "./game/GameConfig";
import {Game} from "./game/Game";

// configure socket
const socket = io();
configureClientSocket(socket);

// create game
const game = new Game(config);

