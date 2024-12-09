import {BootScene} from "./scenes/BootScene";
import {GameScene} from "./scenes/GameScene";
import Phaser from "phaser";

export class Game extends Phaser.Game {
    constructor(conf: Phaser.Types.Core.GameConfig) {
        super(conf);

        // add scene
        this.scene.add('BootScene', BootScene);
        this.scene.add('GameScene', GameScene);

        this.scene.start('BootScene');
    }
}