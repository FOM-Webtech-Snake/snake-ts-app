import Phaser from "phaser";
import {Background} from "../ui/Background";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

export class GameScene extends Phaser.Scene {
    private background: Background;

    constructor() {
        super(sceneConfig);
    }

    preload() {

    }

    create() {
        this.background = new Background(this);
    }
}