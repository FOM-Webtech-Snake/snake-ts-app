import Phaser from "phaser";
import {PhaserSnake} from "./PhaserSnake";
import {Position} from "../../../shared/model/Position";
import {Obstacle} from "../../../shared/model/Obstacle";
import {ObstacleTypeEnum} from "../../../shared/constants/ObstacleTypeEnum";
import {obstacles} from "../../../shared/config/Obstacles";

const OBSTACLE_SCALE = 0.6;

export class PhaserObstacle extends Obstacle {

    // physics
    private scene: Phaser.Scene;
    private item: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Phaser.Scene, id: string, type: ObstacleTypeEnum, pos: Position) {
        super(id, type, pos);
        this.scene = scene;

        // init collectable sprite
        this.item = this.scene.physics.add.sprite(this.position.getX(), this.position.getY(), obstacles[this.type].imageKey);
        this.item.setScale(OBSTACLE_SCALE);
        this.item.setDepth(1);
    }

    checkCollision(snake: PhaserSnake): boolean {
        return this.item && this.item.visible && Phaser.Geom.Intersects.RectangleToRectangle(snake.getHead().getBounds(), this.item.getBounds());
    }

    destroy() {
        if (this.item) {
            this.item.destroy(true);
            this.item = null;
        }
    }

    static fromObstacle(scene: Phaser.Scene, obstacle: Obstacle): PhaserObstacle {
        return new PhaserObstacle(scene, obstacle.getId(), obstacle.getType(), obstacle.getPosition());
    }
}