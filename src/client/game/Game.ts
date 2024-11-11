import {BootScene} from "./scenes/BootScene";
import {MenuScene} from "./scenes/MenuScene";

export class Game extends Phaser.Game {
    constructor(conf: any) {
        super(conf);

        this.scene.add('BootScene', BootScene);
        this.scene.add('MenuScene', MenuScene);
        this.scene.start('BootScene');
    }
}