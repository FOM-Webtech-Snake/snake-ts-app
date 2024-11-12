import '../../public/css/main.css'; // this will apply the css globally
import '@fortawesome/fontawesome-free/css/all.min.css'; // this will add fontawesome to the app
import configureClientSocket from "./sockets/socket";
import {io} from "socket.io-client";
import {Footer} from "./Footer";
import {GameConfigUtil} from "./game/util/GameConfigUtil";
import Phaser from "phaser";
import {GameUtil} from "./game/util/GameUtil";


window.addEventListener('DOMContentLoaded', () => {
    // configure socket
    const socket = io();
    configureClientSocket(socket);

    // create game config
    const config: Phaser.Types.Core.GameConfig = GameConfigUtil.createGameConfig(800, 600, "game-container");

    // create game
    const game = GameUtil.createGame(config);
    const footer = new Footer();
});


