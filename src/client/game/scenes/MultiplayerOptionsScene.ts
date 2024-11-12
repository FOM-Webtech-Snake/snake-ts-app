import {Button} from "../ui/Button";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'MultiplayerOptionsScene',
};

export class MultiplayerOptionsScene extends Phaser.Scene {
    constructor() {
        super(sceneConfig);
    }

    create() {
        this.add.text(this.cameras.main.width / 2, 150, 'Multiplayer Online', {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5);

        const localGameBtn = new Button(this, this.cameras.main.width / 2, 200, "Local Game", () => {
            this.scene.start('GameScene', {});
        });

        // Host Game Button
        const hostBtn = new Button(this, this.cameras.main.width / 2, 300, "Host Game", () => {
            // TODO: Add lobby screen
            this.scene.start('GameScene', {});
        });

        // Join Game Button
        const joinBtn = new Button(this, this.cameras.main.width / 2, 400, "Join Game", () => {
            // TODO: Add "enter sessionID" screen -> after join show lobby
            this.scene.start('GameScene', {});
        });

        // Back Button to go back to main menu
        const backBtn = new Button(this, this.cameras.main.width / 2, 500, "Back", () => {
            this.scene.start('MenuScene'); // Back to the main menu
        });
    }
}