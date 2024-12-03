import Phaser from "phaser";

const tileSize: number = 25; // tile size in pixel
const colors = [0xA9D751, 0xA2D04A]; // two colors of the tiles

export class Background {
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        let cols = Math.ceil(scene.physics.world.bounds.width / tileSize);
        let rows = Math.ceil(scene.physics.world.bounds.height / tileSize);

        this.graphics = scene.add.graphics();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const colorIndex = (row + col) % 2;
                const color = colors[colorIndex];

                this.graphics.fillStyle(color, 1);

                const x = col * tileSize;
                const y = row * tileSize;
                this.graphics.fillRect(x, y, tileSize, tileSize);
            }
        }

        this.drawBorder(scene.physics.world.bounds);
    }

    private drawBorder(bounds: Phaser.Geom.Rectangle) {
        const borderColor = 0x3236a8;
        const borderWidth = 15;

        this.graphics.lineStyle(borderWidth, borderColor, 1);

        this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    destroy(){
        this.graphics.destroy(true);
    }
}