import Phaser from "phaser";
import {ChildCollectableTypeEnum} from "../../../shared/constants/CollectableTypeEnum";
import {childCollectables} from "../../../shared/model/Collectables";
import {Snake} from "./Snake";

const COLLECTABLE_SCALE = 0.5;

export class Collectable {
a
    // config
    private type: ChildCollectableTypeEnum;

    // physics
    private scene: Phaser.Scene;
    private item: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Phaser.Scene, type: ChildCollectableTypeEnum) {
        this.scene = scene;
        this.type = type;

        this.item = this.scene.physics.add.sprite(100, 100, childCollectables[this.type].imageKey);
        this.item.setScale(COLLECTABLE_SCALE);
        this.item.setDepth(1);
    }

    checkCollision(snake: Snake): boolean {
        if (this.item && this.item.visible && Phaser.Geom.Intersects.RectangleToRectangle(snake.getHead().getBounds(), this.item.getBounds())) {
            childCollectables[this.type].func(snake);
            this.item.destroy(true);
            return true;
        }
        return false;
    }
}