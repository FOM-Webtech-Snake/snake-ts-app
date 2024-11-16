import Phaser from "phaser";
import {DirectionUtil} from "../util/DirectionUtil";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {ColorUtil} from "../util/ColorUtil";
import {Position} from "../../../shared/model/Position";

const SNAKE_SCALE: number = 0.15;
const POSITION_HISTORY_BUFFER: number = 20;
const DEFAULT_SNAKE_LENGTH: number = 3;
const DEFAULT_SNAKE_SPEED: number = 100;
const DEFAULT_SNAKE_DIRECTION: DirectionEnum = DirectionEnum.RIGHT;

export class Snake {

    // movement
    private speed: number;
    private direction: DirectionEnum;
    private directionLock: boolean;
    private justReversed: boolean;

    // colors
    private primaryColor: number;
    private darkColor: number;
    private lightColor: number;

    // physics
    private scene: Phaser.Scene;
    private readonly head: Phaser.Physics.Arcade.Sprite;
    private readonly face: Phaser.Physics.Arcade.Sprite;
    private headGroup: Phaser.Physics.Arcade.Group;
    private body: Phaser.Physics.Arcade.Group;

    // location history
    private lastPositions: Position[] = []; // To store the last positions of body parts

    constructor(scene: Phaser.Scene, color: number, pos: Position) {
        this.scene = scene;

        // init movement
        this.speed = DEFAULT_SNAKE_SPEED;
        this.direction = DEFAULT_SNAKE_DIRECTION;
        this.directionLock = false;
        this.justReversed = false;

        // store primary color and create colors for tinting
        this.primaryColor = color;
        this.darkColor = ColorUtil.darkenColor(this.primaryColor);
        this.lightColor = ColorUtil.lightenColor(this.primaryColor);

        // create the body
        this.body = scene.physics.add.group();
        for (let i = 0; i < DEFAULT_SNAKE_LENGTH; i++) {
            const bodyPart = this.addSegmentToBody(pos);
            if (i === 0) {
                this.head = bodyPart;
            }
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
        this.headGroup.setVelocity(directionVector.x * this.speed, directionVector.y * this.speed);

        // make face follow the direction
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        this.saveCurrentHeadCoordinates();
        this.removeOldPositionsFromHistory();
        this.unlockDirection();
    }

    setPrimaryColor(color: number) {
        this.primaryColor = color;
        this.lightColor = ColorUtil.lightenColor(this.primaryColor);
        this.darkColor = ColorUtil.darkenColor(this.primaryColor);
        this.body.setTint(this.lightColor, this.lightColor, this.darkColor, this.darkColor);
    }

    setDirection(newDirection: DirectionEnum): void {
        if (!this.directionLock && newDirection != DirectionUtil.getOppositeDirection(this.direction)) {
            this.direction = newDirection;
            this.lockDirection();
        }
    }

    changeSpeedByFactor(factor: number): void {
        this.speed = this.speed * factor;
    }

    splitInHalf(): void {
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
        const halfLength = Math.ceil(bodyParts.length / 2);

        // remove the second half of the body
        for (let i = halfLength; i < bodyParts.length; i++) {
            const segment = bodyParts[i];
            this.body.remove(segment, true, true);
        }
    }

    doubleLength(): void {
        const currentLength = this.body.getLength();
        const spawnPos: Position = new Position(this.head.x, this.head.y);
        for (let i = 0; i < currentLength; i++) {
            this.addSegmentToBody(spawnPos);
        }
    }

    reverseDirection(): void {
        this.direction = DirectionUtil.getOppositeDirection(this.direction);

        // fix face rotation for new direction
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // set justReversed to true, to temp. disable self collision detection
        this.justReversed = true;
    }

    private addSegmentToBody(pos: Position) {
        const bodyPart = this.scene.physics.add.sprite(pos.getX(), pos.getY(), "snake_body");
        bodyPart.setScale(SNAKE_SCALE);
        bodyPart.setDepth(1);
        bodyPart.setTint(this.lightColor, this.lightColor, this.darkColor, this.darkColor);
        bodyPart.body.allowDrag = false;

        this.body.add(bodyPart);
        return bodyPart;
    }

    private unlockDirection() {
        this.directionLock = false;
    }

    private lockDirection() {
        this.directionLock = true;
    }

    private saveCurrentHeadCoordinates(): void {
        // save the current head position at the start of the array
        this.lastPositions.unshift(new Position(this.head.x, this.head.y));
    }

    /**
     * removes old positions from the position history to keep the position tracking
     * efficient and within the needed bounds.
     *
     * @private
     */
    private removeOldPositionsFromHistory() {
        const bodyLength = this.body.getChildren().length;
        const segmentWidth = Math.ceil(this.head.displayWidth);
        const minPositionsNeeded = (bodyLength * segmentWidth) + POSITION_HISTORY_BUFFER;

        // remove all excess positions at once if we have more than the minimum required
        if (this.lastPositions.length > minPositionsNeeded) {
            // remove all excess positions from the end of the array
            this.lastPositions.splice(minPositionsNeeded + 1);
        }
    }

    private moveBodyParts() {
        // get all body parts as an array
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
        const segmentSpacing: number = Math.round(this.head.displayWidth);

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
                distance = Phaser.Math.Distance.Between(positionA.getX(), positionA.getY(), positionB.getX(), positionB.getY());
                accumulatedDistance += distance;

                // Stop once the accumulated distance reaches or exceeds the target distance
                if (accumulatedDistance >= targetDistance) {
                    break;
                }
            }

            // set the segment position if a valid target position is found, interpolate between them to get the best position
            if (positionB && distance > 0) {
                const overshoot = accumulatedDistance - targetDistance; // e.g. 90 - 87 = 3
                const interpolationFactor = 1 - (overshoot / distance)
                const segmentPosition = {
                    x: Phaser.Math.Linear(positionB.getX(), positionA.getX(), interpolationFactor),
                    y: Phaser.Math.Linear(positionB.getY(), positionA.getY(), interpolationFactor),
                };

                currentSegment.setPosition(segmentPosition.x, segmentPosition.y);
            }
        }
    }

}