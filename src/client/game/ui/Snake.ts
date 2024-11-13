import Phaser from "phaser";
import {DirectionUtil} from "../util/DirectionUtil";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";

const SNAKE_SCALE: number = 0.1;
const DEFAULT_SNAKE_LENGTH: number = 3;
const DEFAULT_SNAKE_SPEED: number = 100;
const DEFAULT_SNAKE_DIRECTION: DirectionEnum = DirectionEnum.RIGHT;

export class Snake {
    private direction: DirectionEnum = DEFAULT_SNAKE_DIRECTION;
    private speed: number = DEFAULT_SNAKE_SPEED;
    private color: number = 0xff0000;

    private face: Phaser.GameObjects.Sprite;
    private head: Phaser.Physics.Arcade.Image;
    private body: Phaser.Physics.Arcade.Group;
    private lastPositions: { x: number, y: number }[] = []; // To store the last positions of body parts

    constructor(scene: Phaser.Scene) {
        this.face = scene.add.sprite(0, 0, "snake_face");
        this.face.setScale(SNAKE_SCALE);
        this.face.setDepth(2);

        // create the body
        this.body = scene.physics.add.group();
        for (let i = 0; i < DEFAULT_SNAKE_LENGTH; i++) {
            const bodyPart = scene.physics.add.image(0, 100, "snake_body");
            bodyPart.setTint(this.color);
            bodyPart.setScale(SNAKE_SCALE);
            bodyPart.setDepth(1);
            this.body.add(bodyPart);

            if (i === 0) {
                /* if counter (i) is 0 it will be the head */
                this.head = bodyPart;
            }
        }
    }

    getHead(): any {
        return this.head;
    }

    update() {
        this.moveBodyParts(); // move the body parts since the head is moving automatically by phaser

        // update the head direction
        const directionVector = DirectionUtil.getDirectionVector(this.direction);
        this.head.setVelocity(directionVector.x * this.speed, directionVector.y * this.speed);

        // make face follow the head and set rotation
        this.face.setPosition(this.head.x, this.head.y);
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        this.saveCurrentHeadCoordinates();
    }

    setDirection(direction: DirectionEnum) {
        this.direction = direction;
    }

    private saveCurrentHeadCoordinates() {
        this.lastPositions.unshift({x: this.head.x, y: this.head.y});
        // Ensure lastPositions doesn't exceed the body length
        if (this.lastPositions.length > this.body.getChildren().length * this.head.displayWidth) {
            this.lastPositions.pop();  // Remove the last position if array is too long
        }
    }

    private moveBodyParts() {
        // Get all body parts as an array
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Image[];

        // Loop through each segment of the body 0 is the head and therefore skipped
        for (let i = 1; i < bodyParts.length; i++) {
            const currentSegment = bodyParts[i];

            // Calculate how far back in lastPositions this segment should be following
            const positionIndex = i * currentSegment.body.width;

            // Find the nearest integer index to maintain the required spacing
            const roundedIndex = Math.round(positionIndex);

            // Check if there is a saved position in lastPositions for this index
            if (this.lastPositions[roundedIndex]) {
                const targetPosition = this.lastPositions[roundedIndex];
                currentSegment.setPosition(targetPosition.x, targetPosition.y);
            }
        }
    }
}