import Phaser from "phaser";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.ui.Overlay");

export class Overlay {
    private scene: Phaser.Scene;
    private textObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, defaultMessage: string = "") {
        this.scene = scene;

        this.textObject = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            defaultMessage,
            {fontSize: '32px', color: '#fff', backgroundColor: '#000'}
        )
            .setOrigin(0.5)
            .setScrollFactor(0) // Ensures it stays fixed on the camera
            .setVisible(false)
            .setDepth(99);
    }

    /**
     * Show the overlay with a specified message.
     * @param message The message to display
     */
    public show(message: string): void {
        log.info("show triggered");
        this.textObject.setText(message);
        this.textObject.setVisible(true);
    }

    /**
     * Show the overlay with a "Press [Key] to [Action]" message.
     * @param key The key to display
     * @param action The action description
     */
    public showPressKeyToAction(key: string, action: string): void {
        const message = `Press [${key}] to ${action}`;
        this.show(message);
    }

    /**
     * Hide the overlay.
     */
    public hide(): void {
        log.info("hide triggered");
        this.textObject.setVisible(false);
    }
}
