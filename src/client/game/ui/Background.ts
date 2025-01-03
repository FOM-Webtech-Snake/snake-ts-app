import Phaser, {Scene} from "phaser";

const TILE_SIZE: number = 25; // tile size in pixel
const COLORS = [0xA9D751, 0xA2D04A]; // two colors of the tiles
const BORDER_WIDTH: number = 10;

export class Background {
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        let cols = Math.ceil(scene.physics.world.bounds.width / TILE_SIZE);
        let rows = Math.ceil(scene.physics.world.bounds.height / TILE_SIZE);

        this.graphics = scene.add.graphics();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const colorIndex = (row + col) % 2;
                const color = COLORS[colorIndex];

                this.graphics.fillStyle(color, 1);

                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;
                this.graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }

        this.drawBorder(scene);
    }

    private drawBorder(scene: Scene) {
        const bounds = scene.physics.world.bounds;

        // create borders
        scene.add.tileSprite(
            bounds.x,
            bounds.y,
            bounds.width,
            BORDER_WIDTH,
            'border_texture'
        ).setOrigin(0, 0); // top

        scene.add.tileSprite(
            bounds.x,
            bounds.y + bounds.height - BORDER_WIDTH,
            bounds.width,
            BORDER_WIDTH,
            'border_texture'
        ).setOrigin(0, 0); // bottom

        scene.add.tileSprite(
            bounds.x,
            bounds.y,
            BORDER_WIDTH,
            bounds.height,
            'border_texture'
        ).setOrigin(0, 0); // left

        scene.add.tileSprite(
            bounds.x + bounds.width - BORDER_WIDTH,
            bounds.y,
            BORDER_WIDTH,
            bounds.height,
            'border_texture'
        ).setOrigin(0, 0); // right
    }

    destroy(){
        this.graphics.destroy(true);
    }
}