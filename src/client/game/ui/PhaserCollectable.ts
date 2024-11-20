import Phaser from "phaser";
import {ChildCollectableTypeEnum} from "../../../shared/constants/CollectableTypeEnum";
import {childCollectables} from "../../../shared/model/Collectables";
import {Snake} from "./Snake";
import {Collectable} from "../../../shared/model/Collectable";
import {Position} from "../../../shared/model/Position";

const COLLECTABLE_SCALE = 0.5;

export class PhaserCollectable extends Collectable {

    // physics
    private scene: Phaser.Scene;
    private item: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Phaser.Scene, id: string, type: ChildCollectableTypeEnum, pos: Position) {
        super(id, type, pos);
        this.scene = scene;

        this.item = this.scene.physics.add.sprite(this.position.getX(), this.position.getY(), childCollectables[this.type].imageKey);
        this.item.setScale(COLLECTABLE_SCALE);
        this.item.setDepth(1);
    }

    checkCollision(snake: Snake): boolean {
        return this.item && this.item.visible && Phaser.Geom.Intersects.RectangleToRectangle(snake.getHead().getBounds(), this.item.getBounds());
    }

    applyAndDestroy(snake: Snake) {
        childCollectables[this.type].func(snake);
        this.item.destroy(true);
    }

    destroy() {
        this.item.destroy(true);
    }

    static fromData(scene: Phaser.Scene, data: any): PhaserCollectable {
        return new PhaserCollectable(scene, data.id, data.type, Position.fromData(data.position));
    }
}