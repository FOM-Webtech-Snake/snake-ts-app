import Phaser from "phaser";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.ui.Overlay");

export class Overlay {
    private scene: Phaser.Scene;
    private isVisible: boolean;
    private backgroundObject: Phaser.GameObjects.Rectangle;
    private textObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, defaultMessage: string = "") {
        this.scene = scene;
        this.isVisible = false;

        this.backgroundObject = this.scene.add.rectangle(this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2, this.scene.cameras.main.width,
            this.scene.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setVisible(this.isVisible)
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
            .setVisible(this.isVisible)
            .setDepth(99);
    }

    /**
     * Show the overlay with a specified message.
     * @param message The message to display
     */
    public show(message: string): void {
        log.debug("show triggered");
        this.isVisible = true;
        this.backgroundObject.setVisible(this.isVisible);
        this.textObject.setText(message);
        this.textObject.setVisible(this.isVisible);
    }

    /**
     * Show the overlay with a "Press [Key] to [Action]" message.
     * @param key The key to display
     * @param action The action description
     */
    public showPressKeyToAction(key: string, action: string): void {
        log.debug("show press key to action", key, action);
        const message = `Press [${key}] to ${action}`;
        this.show(message);
    }

    /**
     * Hide the overlay.
     */
    public hide(): void {
        log.debug("hide triggered");
        this.isVisible = false;
        this.backgroundObject.setVisible(this.isVisible);
        this.textObject.setVisible(this.isVisible);
    }

    public destroy(): void {
        if (this.backgroundObject) {
            this.backgroundObject.destroy(true);
        }
        if (this.textObject) {
            this.textObject.destroy(true);
        }
    }

    update() {
        if (!this.isVisible) return;

        this.backgroundObject.setPosition(this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2);
        this.backgroundObject.setSize(
            this.scene.cameras.main.width,
            this.scene.cameras.main.height
        );
        this.textObject.setPosition(this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2);
    }
}
