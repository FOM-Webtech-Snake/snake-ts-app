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

    /**
     * removes old positions from the position history to keep the position tracking
     * efficient and within the needed bounds.
     *
     * @param {number} bodyLength - the current length of the snake body
     * @param {number} segmentWidth - the width of each body segment.
     * @private
     */
    private removeOldPositionsFromHistory(bodyLength: number, segmentWidth: number) {
        const minPositionsNeeded = bodyLength * segmentWidth;

        // remove all excess positions at once if we have more than the minimum required
        if (this.lastPositions.length > minPositionsNeeded) {
            // remove all excess positions from the end of the array
            this.lastPositions.splice(minPositionsNeeded + 1);
        }
    }

    private moveBodyParts() {
        // get all body parts as an array
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
        const segmentSpacing: number = this.head.displayWidth;

        // loop through each segment of the body, skipping the head (index 0)
        for (let i = 1; i < bodyParts.length; i++) {
            const currentSegment = bodyParts[i];

            // The target distance for this segment from the head
            const targetDistance: number = i * segmentSpacing;
            let accumulatedDistance: number = 0;

            let positionA = this.lastPositions[0]; // set starting position to 0 for the fist iteration
            let positionB = null;
            let distance = 0;

            // loop through lastPositions to find the two closest points around the target distance
            for (let j = 1; j < this.lastPositions.length; j++) {
                positionA = this.lastPositions[j - 1];
                positionB = this.lastPositions[j];

                // calculate the distance between the two positions
                distance = Phaser.Math.Distance.Between(positionA.x, positionA.y, positionB.x, positionB.y);
                accumulatedDistance += distance;

                // Stop once the accumulated distance reaches or exceeds the target distance
                if (accumulatedDistance >= targetDistance) {
                    break;
                }
            }

            // set the segment position if a valid target position is found, interpolate between them to get the best position
            if (positionB) {
                const overshoot = accumulatedDistance - targetDistance; // e.g. 90 - 87 = 3
                const interpolationFactor = 1 - (overshoot / distance)
                const segmentPosition = {
                    x: Phaser.Math.Interpolation.Linear([positionB.x, positionA.x], interpolationFactor),
                    y: Phaser.Math.Interpolation.Linear([positionB.y, positionA.y], interpolationFactor),
                };

                currentSegment.setPosition(segmentPosition.x, segmentPosition.y);
            }
        }
    }

}