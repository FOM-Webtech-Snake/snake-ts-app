import {Game} from "../Game";
import Phaser from "phaser";
import {Socket} from "socket.io-client";

export class GameUtil {
    static createGame(conf: Phaser.Types.Core.GameConfig, socket: Socket): Game {
        if (!conf.parent) throw new Error("parent must be defined in GameConfig");
        return new Game(conf, socket);
    }
}