import Phaser from "phaser";
import {ChildCollectableTypeEnum} from "../../../shared/constants/CollectableTypeEnum";
import {childCollectables} from "../../../shared/model/Collectables";
import {Snake} from "./Snake";
import {Collectable} from "../../../shared/model/Collectable";
import {Position} from "../../../shared/model/Position";

const COLLECTABLE_SCALE = 0.5;
const ARROW_SCALE = 0.2;

export class PhaserCollectable extends Collectable {

    // physics
    private scene: Phaser.Scene;
    private item: Phaser.Physics.Arcade.Sprite;
    private arrow: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, id: string, type: ChildCollectableTypeEnum, pos: Position) {
        super(id, type, pos);
        this.scene = scene;

        // init collectable sprite
        this.item = this.scene.physics.add.sprite(this.position.getX(), this.position.getY(), childCollectables[this.type].imageKey);
        this.item.setScale(COLLECTABLE_SCALE);
        this.item.setDepth(1);

        // init arrow for collectable
        this.arrow = this.scene.add.image(0, 0, 'collectable_arrow');
        this.arrow.setScale(ARROW_SCALE);
        this.arrow.setDepth(10);
        this.arrow.setVisible(false);
    }

    checkCollision(snake: Snake): boolean {
        return this.item && this.item.visible && Phaser.Geom.Intersects.RectangleToRectangle(snake.getHead().getBounds(), this.item.getBounds());
    }

    applyAndDestroy(snake: Snake) {
        childCollectables[this.type].func(snake);
        this.item.destroy(true);
    }

    destroy() {
        if (this.item) {
            this.item.destroy(true);
            this.item = null;
        }
        if (this.arrow) {
            this.arrow.destroy(true);
            this.arrow = null;
        }
    }

    updateArrow(camera: Phaser.Cameras.Scene2D.Camera) {
        if (!this.arrow) return;

        const {x, y, width, height} = camera.worldView;
        const cameraCenterX = x + width / 2;
        const cameraCenterY = y + height / 2;

        const collectableX = this.position.getX();
        const collectableY = this.position.getY();

        // Check if the collectable is within the camera's view
        if (x <= collectableX && collectableX <= x + width && y <= collectableY && collectableY <= y + height) {
            this.arrow.setVisible(false);
            return;
        }

        // Calculate the angle and edge point
        const angle = Phaser.Math.Angle.Between(cameraCenterX, cameraCenterY, collectableX, collectableY);
        const edgePoint = this.getEdgePoint(angle, camera.worldView);

        // Position and rotate the arrow
        this.arrow.setPosition(edgePoint.x, edgePoint.y);
        this.arrow.setRotation(angle);
        this.arrow.setVisible(true);
    }

    private getEdgePoint(angle: number, worldView: Phaser.Geom.Rectangle): Phaser.Math.Vector2 {
        const {x, y, width, height} = worldView;

        // Offset to keep the arrow inside the bounds (adjust this based on arrow size)
        const arrowWidthOffset = (this.arrow.width * this.arrow.scaleX) / 2;
        const arrowHeightOffset = (this.arrow.height * this.arrow.scaleY) / 2;

        // Determine the edge point along the rectangle
        const edgeX = x + width / 2 + Math.cos(angle) * (width / 2 - arrowWidthOffset);
        const edgeY = y + height / 2 + Math.sin(angle) * (height / 2 - arrowHeightOffset);

        // Clamp within the camera bounds minus the offset
        const clampedX = Phaser.Math.Clamp(edgeX, x + arrowWidthOffset, x + width - arrowWidthOffset);
        const clampedY = Phaser.Math.Clamp(edgeY, y + arrowHeightOffset, y + height - arrowHeightOffset);

        return new Phaser.Math.Vector2(clampedX, clampedY);
    }

    static fromData(scene: Phaser.Scene, data: any): PhaserCollectable {
        return new PhaserCollectable(scene, data.id, data.type, Position.fromData(data.position));
    }
}