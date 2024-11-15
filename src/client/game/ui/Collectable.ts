import Phaser from "phaser";
import {ChildCollectableTypeEnum} from "../../../shared/constants/CollectableTypeEnum";
import {childCollectables, collectables} from "../../../shared/model/Collectables";

const COLLECTABLE_SCALE = 0.5;

export class Collectable {

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
}