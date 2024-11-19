import {BootScene} from "./scenes/BootScene";
import {GameScene} from "./scenes/GameScene";
import Phaser from "phaser";
import {GlobalPropKeyEnum} from "./constants/GlobalPropKeyEnum";
import {Socket} from "socket.io-client";

export class Game extends Phaser.Game {
    constructor(conf: Phaser.Types.Core.GameConfig, socket: Socket) {
        super(conf);

        // to make custom params available, we need to register them in the data manager of phaser
        this.registry.set(GlobalPropKeyEnum.SOCKET, socket);

        // add scene
        this.scene.add('BootScene', BootScene);
        this.scene.add('GameScene', GameScene);

        this.scene.start('BootScene');
    }
}