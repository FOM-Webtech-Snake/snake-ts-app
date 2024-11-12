import '../../public/css/main.css'; // this will apply the css globally
import '@fortawesome/fontawesome-free/css/all.min.css'; // this will add fontawesome to the app
import configureClientSocket from "./sockets/socket";
import {io} from "socket.io-client";
import config from "./game/GameConfig";
import {Game} from "./game/Game";
import {Footer} from "./Footer";


window.addEventListener('DOMContentLoaded', () => {
    // configure socket
    const socket = io();
    configureClientSocket(socket);

    // create game
    const game = new Game(config);
    const footer = new Footer();
});


