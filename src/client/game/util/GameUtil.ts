import {Game} from "../Game";
import Phaser from "phaser";

export class GameUtil {
    static createGame(conf: Phaser.Types.Core.GameConfig): Game {
        if (!conf.parent) throw new Error("parent must be defined in GameConfig");
        return new Game(conf);
    }
}