import {BootScene} from "./scenes/BootScene";
import {MenuScene} from "./scenes/MenuScene";
import {MultiplayerOptionsScene} from "./scenes/MultiplayerOptionsScene";
import Phaser from "phaser";

export class Game extends Phaser.Game {
    constructor(conf: Phaser.Types.Core.GameConfig) {
        super(conf);

        this.scene.add('BootScene', BootScene);
        this.scene.add('MenuScene', MenuScene);
        this.scene.add('MultiplayerOptionsScene', MultiplayerOptionsScene);
        this.scene.start('BootScene');
    }
}