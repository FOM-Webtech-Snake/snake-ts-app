import {Button} from "../ui/Button";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'MenuScene',
};

export class MenuScene extends Phaser.Scene {
    constructor() {
        super(sceneConfig);
    }

    create() {
        this.add.image(this.cameras.main.width / 2, 150, 'logo');

        // Main menu buttons
        const singlePlayerBtn = new Button(this, this.cameras.main.width / 2, 300, "Singleplayer", () => {
            this.scene.start('GameScene', {});
        });

        const multiPlayerBtn = new Button(this, this.cameras.main.width / 2, 400, "Multiplayer", () => {
            this.scene.start('MultiplayerOptionsScene');
        });

        const howToPlayBtn = new Button(this, this.cameras.main.width / 2, 500, 'How To Play', () => {
            // TODO: implement how to play
        });

    }
}