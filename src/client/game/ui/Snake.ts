import Phaser from "phaser";
import {DirectionUtil} from "../util/DirectionUtil";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {ColorUtil} from "../util/ColorUtil";
import {Position} from "../../../shared/model/Position";

const SNAKE_SCALE: number = 0.15;
const MOVEMENT_INTERPOLATION_FACTOR = 0.2; // 0-1 => 0: smooth movement, 1: direct movement
const POSITION_HISTORY_BUFFER_MULTIPLIER: number = 2;
const DEFAULT_SNAKE_LENGTH: number = 4;
const DEFAULT_SNAKE_SPEED: number = 100;
const DEFAULT_SNAKE_DIRECTION: DirectionEnum = DirectionEnum.RIGHT;

export class Snake {

    // identifier
    private playerId: string;

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
    private lockedSegments: Phaser.Physics.Arcade.Group;

    // location history
    private lastPositions: Position[] = []; // To store the last positions of body parts

    constructor(scene: Phaser.Scene, playerId: string, color: number, pos: Position) {
        this.scene = scene;
        this.playerId = playerId;

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
        this.body = this.scene.physics.add.group();
        this.lockedSegments = this.scene.physics.add.group();
        for (let i = 0; i < DEFAULT_SNAKE_LENGTH; i++) {
            const bodyPart = this.addSegmentToBody(pos);
            if (i === 0) {
                this.head = bodyPart;
            }
        }

        // create the face
        this.face = this.scene.physics.add.sprite(this.head.x, this.head.y, "snake_face");
        this.face.setScale(SNAKE_SCALE);
        this.face.setDepth(2);
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // create the headGroup
        this.headGroup = this.scene.physics.add.group();
        this.headGroup.add(this.head);
        this.headGroup.add(this.face);
    }

    getHead(): Phaser.Physics.Arcade.Sprite {
        return this.head;
    }

    getPlayerId() {
        return this.playerId;
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

    changeSpeedBy(value: number): void {
        this.speed += value;
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
            this.addSegmentToBody(spawnPos, true);
        }
    }

    increase(){
        const spawnPos: Position = new Position(this.head.x, this.head.y);
        this.addSegmentToBody(spawnPos, true);
    }

    reverseDirection(): void {
        this.direction = DirectionUtil.getOppositeDirection(this.direction);

        // fix face rotation for new direction
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // set justReversed to true, to temp. disable self collision detection
        this.justReversed = true;
    }

    private addSegmentToBody(pos: Position, lockPosition: boolean = false) {
        const bodyPart = this.scene.physics.add.sprite(pos.getX(), pos.getY(), "snake_body");
        bodyPart.setScale(SNAKE_SCALE);
        bodyPart.setDepth(1);
        bodyPart.setTint(this.lightColor, this.lightColor, this.darkColor, this.darkColor);
        bodyPart.body.allowDrag = false;

        if (lockPosition) this.lockedSegments.add(bodyPart);

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
     */
    private removeOldPositionsFromHistory() {
        const bodyLength = this.body.getChildren().length;
        const segmentWidth = Math.ceil(this.head.displayWidth);
        const minPositionsNeeded = (bodyLength * segmentWidth) * POSITION_HISTORY_BUFFER_MULTIPLIER;

        // remove all excess positions at once if we have more than the minimum required
        if (this.lastPositions.length > minPositionsNeeded) {
            // remove all excess positions from the end of the array
            this.lastPositions.splice(minPositionsNeeded + 1);
        }
    }

    // changed 2024-11-17 (removed complex interpolation logic
    private moveBodyParts() {
        // get all body parts as an array
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
        const segmentSpacing: number = Math.round(this.head.displayWidth);

        // loop through each segment of the body, skipping the head (index 0)
        let lastUsedPositionsIndex = 0;
        for (let i = 1; i < bodyParts.length; i++) {
            const currentSegment = bodyParts[i];

            // locked position logic (follow when old tail has reached spawn position
            if (this.lockedSegments.contains(currentSegment)) {
                // check all smaller indexed segments for overlapping
                let isOverlapping = false;
                for (let k = 0; k < i; k++) {
                    const smallerSegment = bodyParts[k];
                    if (Phaser.Geom.Intersects.RectangleToRectangle(currentSegment.getBounds(), smallerSegment.getBounds())) {
                        isOverlapping = true;
                        break;
                    }
                }
                if (!isOverlapping) {
                    this.lockedSegments.remove(currentSegment, false, false);
                } else {
                    // skip element if it is locked in position
                    continue;
                }
            }

            // The target distance for this segment from the head
            let positionA: Position = this.lastPositions[lastUsedPositionsIndex];
            let positionB: Position = null;
            let distance: number = 0;

            // loop through lastPositions to find the next position in relation to the segment spacing
            for (let j = lastUsedPositionsIndex; j < this.lastPositions.length; j++) {
                positionB = this.lastPositions[j];

                // calculate the distance between the two positions
                distance = Phaser.Math.Distance.Between(positionA.getX(), positionA.getY(), positionB.getX(), positionB.getY());

                // Stop once the distance reaches or exceeds the necessary segment spacing
                if (distance >= segmentSpacing) {
                    lastUsedPositionsIndex = j;
                    break;
                }
            }

            if (positionB) {

                // TODO: use interpolation?
                const interpolationFactor = MOVEMENT_INTERPOLATION_FACTOR * (this.speed / DEFAULT_SNAKE_SPEED);
                // Apply interpolation to smooth the movement of the segment towards the new position
                const interpolatedX = Phaser.Math.Linear(currentSegment.x, positionB.getX(), MOVEMENT_INTERPOLATION_FACTOR);
                const interpolatedY = Phaser.Math.Linear(currentSegment.y, positionB.getY(), MOVEMENT_INTERPOLATION_FACTOR);
                // Set the segment position to the interpolated position
                currentSegment.setPosition(interpolatedX, interpolatedY);


                //currentSegment.setPosition(positionB.getX(), positionB.getY());
            }
        }
    }

    static fromJson(scene: Phaser.Scene, json: string): Snake {
        const data = JSON.parse(json);
        return this.fromData(scene, data);
    }

    static fromData(scene: Phaser.Scene, data: any) {
        const snake = new Snake(scene, data.playerId, data.primaryColor, new Position(data.head.x, data.head.y));
        snake.updateFromData(data);
        return snake;
    }

    updateFromData(data: any): void {
        this.speed = data.speed;
        this.direction = data.direction;
        //this.directionLock = data.directionLock;
        //this.justReversed = data.justReversed;
        this.primaryColor = data.primaryColor;
        //this.darkColor = data.darkColor;
        //this.lightColor = data.lightColor;
        //this.lastPositions = data.lastPositions.map((pos: any) => new Position(pos.x, pos.y));

        const currentBodyLength = this.body.getLength();
        const dataBodyLength = data.body.length;

        // Update body parts
        if (dataBodyLength > currentBodyLength) {
            // Add new segments
            for (let i = currentBodyLength; i < dataBodyLength; i++) {
                this.addSegmentToBody(new Position(data.body[i].x, data.body[i].y));
            }
        } else if (dataBodyLength < currentBodyLength) {
            // Remove extra segments
            for (let i = currentBodyLength - 1; i >= dataBodyLength; i--) {
                const segment = this.body.getChildren()[i] as Phaser.Physics.Arcade.Sprite;
                this.body.remove(segment, true, true);
            }
        }

        // Update existing segments
        for (let i = 0; i < Math.min(currentBodyLength, dataBodyLength); i++) {
            const part = this.body.getChildren()[i] as Phaser.Physics.Arcade.Sprite;
            part.setPosition(data.body[i].x, data.body[i].y);
        }

        // Update face position and rotation
        this.face.setPosition(data.face.x, data.face.y);
        this.face.setRotation(data.face.rotation);
    }

    toJson(): string {
        return JSON.stringify({
            playerId: this.playerId,
            speed: this.speed,
            direction: this.direction,
            //directionLock: this.directionLock,
            //justReversed: this.justReversed,
            primaryColor: this.primaryColor,
            //darkColor: this.darkColor,
            //lightColor: this.lightColor,
            head: {x: this.head.x, y: this.head.y},
            face: {x: this.face.x, y: this.face.y, rotation: this.face.rotation},
            //lastPositions: this.lastPositions.map(pos => ({x: pos.getX(), y: pos.getY()})),
            body: this.body.getChildren().map((segment: Phaser.Physics.Arcade.Sprite) => ({
                x: segment.x,
                y: segment.y
            })),
            //lockedSegments: this.lockedSegments.getChildren().map((_: any, index: number) => index) // Store indices of locked segments
        });
    }

    updateFromJson(json: string) {
        const data = JSON.parse(json);
        this.updateFromData(data);
    }

}