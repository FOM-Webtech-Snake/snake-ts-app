import {Game} from "../Game";
import Phaser from "phaser";

export class GameUtil {
    static createGame(conf: Phaser.Types.Core.GameConfig): Game {
        if (!conf.parent) throw new Error("parent must be defined in GameConfig");

        let parentElement = null;
        // if `parent` is a string, interpret it as an ID selector and get the element
        if (typeof conf.parent === "string") {
            parentElement = document.getElementById(conf.parent);
            if (!parentElement) {
                // if no element found with the given ID, create a new div and append it to the body
                parentElement = document.createElement("div");
                parentElement.id = conf.parent; // Optionally set the ID
                document.body.appendChild(parentElement);
            }
        }

        return new Game(conf);
    }
}