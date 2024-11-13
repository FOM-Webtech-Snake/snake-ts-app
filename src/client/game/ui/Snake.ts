import Phaser from "phaser";
import {DirectionUtil} from "../util/DirectionUtil";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";

const SNAKE_SCALE: number = 0.15;
const DEFAULT_SNAKE_LENGTH: number = 3;
const DEFAULT_SNAKE_SPEED: number = 100;
const DEFAULT_SNAKE_DIRECTION: DirectionEnum = DirectionEnum.RIGHT;

export class Snake {
    private direction: DirectionEnum = DEFAULT_SNAKE_DIRECTION;
    private speed: number = DEFAULT_SNAKE_SPEED;
    private color: number = 0xff0000;

    private scene: Phaser.Scene;
    private head: Phaser.Physics.Arcade.Sprite;
    private face: Phaser.Physics.Arcade.Sprite;
    private headGroup: Phaser.Physics.Arcade.Group;
    private body: Phaser.Physics.Arcade.Group;
    private lastPositions: { x: number, y: number }[] = []; // To store the last positions of body parts

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // create the body
        this.body = scene.physics.add.group();
        for (let i = 0; i < DEFAULT_SNAKE_LENGTH; i++) {
            const bodyPart = scene.physics.add.sprite(0, 100, "snake_body");
            bodyPart.setTint(this.color);
            bodyPart.setScale(SNAKE_SCALE);
            bodyPart.setDepth(1);

            if (i === 0) {
                this.head = bodyPart;
            }

            this.body.add(bodyPart);
        }

        // create the face
        this.face = scene.physics.add.sprite(this.head.x, this.head.y, "snake_face");
        this.face.setScale(SNAKE_SCALE);
        this.face.setDepth(2);
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // create the headGroup
        this.headGroup = scene.physics.add.group();
        this.headGroup.add(this.head);
        this.headGroup.add(this.face);
    }

    getHead(): Phaser.Physics.Arcade.Sprite {
        return this.head;
    }

    update(): void {
        this.moveBodyParts(); // move the body parts since the head is moving automatically by phaser

        // update the head direction
        const directionVector = DirectionUtil.getDirectionVector(this.direction);
        //this.head.setVelocity(directionVector.x * this.speed, directionVector.y * this.speed);
        this.headGroup.setVelocity(directionVector.x * this.speed, directionVector.y * this.speed);

        // make face follow the head and set rotation
        //this.face.setPosition(this.head.x, this.head.y);
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        this.saveCurrentHeadCoordinates();
    }

    setDirection(direction: DirectionEnum): void {
        this.direction = direction;
    }

    private saveCurrentHeadCoordinates(): void {
        const bodyLength = this.body.getChildren().length;
        const segmentWidth = this.head.displayWidth;

        // save the current head position at the start of the array
        this.lastPositions.unshift({x: this.head.x, y: this.head.y});

        this.removeOldPositionsFromHistory(bodyLength, segmentWidth);
        console.log("position history item count:", this.lastPositions.length);
    }

    private removeOldPositionsFromHistory(bodyLength: number, segmentWidth: number) {
        const minPositionsNeeded = bodyLength * segmentWidth;

        // only remove the oldest position if we have more than the minimum required positions
        if (this.lastPositions.length > minPositionsNeeded) {
            const headMovementDistance = Phaser.Math.Distance.Between(
                this.head.x,
                this.head.y,
                this.lastPositions[this.lastPositions.length-1].x,
                this.lastPositions[this.lastPositions.length-1].y
            );
            console.log("head movement distance:", headMovementDistance);
            // remove the last position if the head has moved more than a certain threshold
            if (headMovementDistance >= segmentWidth * 0.5) {
                this.lastPositions.pop();
            }
        }
    }

    private moveBodyParts() {
        // Get all body parts as an array
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
        const segmentSpacing = this.head.displayWidth;

        // Loop through each segment of the body, 0 is the head and therefore skipped
        for (let i = 1; i < bodyParts.length; i++) {
            const currentSegment = bodyParts[i];

            // The target distance for this segment from the head
            const targetDistance = i * segmentSpacing;
            let accumulatedDistance = 0;
            let targetPosition = null;

            // Traverse `lastPositions` and accumulate distances until reaching the target distance
            for (let j = 1; j < this.lastPositions.length; j++) {
                const posA = this.lastPositions[j - 1];
                const posB = this.lastPositions[j];

                // Calculate the distance between two consecutive positions
                const distance = Phaser.Math.Distance.Between(posA.x, posA.y, posB.x, posB.y);
                accumulatedDistance += distance;

                // Check if we've reached or exceeded the target distance
                if (accumulatedDistance >= targetDistance) {
                    targetPosition = posB;
                    break;
                }
            }

            // Set the segment position if a valid target position is found
            if (targetPosition) {
                currentSegment.setPosition(targetPosition.x, targetPosition.y);
            }
        }
    }
}