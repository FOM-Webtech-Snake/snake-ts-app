import Phaser from "phaser";

const tileSize: number = 25; // tile size in pixel
const colors = [0xA9D751, 0xA2D04A]; // two colors of the tiles

export class Background {
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        let cols = Math.ceil(scene.scale.width / tileSize);
        let rows = Math.ceil(scene.scale.height / tileSize);

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
    }
}