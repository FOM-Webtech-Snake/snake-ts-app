import Phaser from "phaser";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.ui.Overlay");

export class Overlay {
    private scene: Phaser.Scene;
    private backgroundObject: Phaser.GameObjects.Rectangle;
    private textObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, defaultMessage: string = "") {
        this.scene = scene;

        this.backgroundObject = this.scene.add.rectangle(this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2, this.scene.cameras.main.width,
            this.scene.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setVisible(false)
            .setDepth(99);

        this.textObject = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            defaultMessage,
            {fontSize: '32px', color: '#fff', align: 'center'}
        )
            .setOrigin(0.5)
            .setWordWrapWidth(this.scene.cameras.main.width * 0.8)
            .setScrollFactor(0) // Ensures it stays fixed on the camera
            .setVisible(false)
            .setDepth(99);
    }

    /**
     * Show the overlay with a specified message.
     * @param message The message to display
     */
    public show(message: string): void {
        log.debug("show triggered");
        this.backgroundObject.setVisible(true);
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
        log.debug("hide triggered");
        this.backgroundObject.setVisible(false);
        this.textObject.setVisible(false);
    }

    public destroy(): void {
        if (this.backgroundObject) {
            this.backgroundObject.destroy(true);
        }
        if (this.textObject) {
            this.textObject.destroy(true);
        }
    }
}
