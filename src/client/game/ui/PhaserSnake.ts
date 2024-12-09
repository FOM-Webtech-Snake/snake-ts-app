import Phaser from "phaser";
import {DirectionUtil} from "../util/DirectionUtil";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {ColorUtil} from "../util/ColorUtil";
import {Position} from "../../../shared/model/Position";
import {PlayerStatusEnum} from "../../../shared/constants/PlayerStatusEnum";
import {getLogger} from "../../../shared/config/LogConfig";
import {GameScene} from "../scenes/GameScene";
import {Player} from "../../../shared/model/Player";
import {GLOBAL_SYNC_INTERVAL_IN_MILLIS} from "../../../shared/config/GlobalTickRate";
import {SNAKE_STARTING_SCALE} from "../../../shared/model/GameSessionConfig";

const MOVEMENT_INTERPOLATION_FACTOR = 0.2; // 0-1 => 0: smooth movement, 1: direct movement
const POSITION_HISTORY_BUFFER_MULTIPLIER: number = 2;

const log = getLogger("client.game.ui.PhaserSnake");

export class PhaserSnake {

    // identifier
    private playerId: string;
    private status: PlayerStatusEnum;
    private score: number;

    // movement
    private speed: number;
    private scale: number;
    private direction: DirectionEnum;
    private directionLock: boolean;
    private justReversed: boolean;

    // colors
    private primaryColor: number;
    private darkColor: number;
    private lightColor: number;

    // physics
    private scene: GameScene;
    private head: Phaser.Physics.Arcade.Sprite;
    private face: Phaser.Physics.Arcade.Sprite;
    private headGroup: Phaser.Physics.Arcade.Group;
    private body: Phaser.Physics.Arcade.Group;
    private lockedSegments: Phaser.Physics.Arcade.Group;

    // location history
    private lastPositions: Position[] = []; // To store the last positions of body parts

    private targetPositions: Position[] = []; // this is only used for remoteSnakes
    private lastUpdateTime: number = Date.now();

    constructor(
        scene: GameScene,
        playerId: string,
        status: PlayerStatusEnum,
        score: number,
        color: number,
        speed: number,
        scale: number,
        direction: DirectionEnum,
        positions: Position[]
    ) {
        this.scene = scene;
        this.playerId = playerId;
        this.status = status;
        this.score = score;

        // init movement
        this.speed = speed;
        this.scale = scale;
        this.direction = direction;
        this.directionLock = false;
        this.justReversed = false;

        // store primary color and create colors for tinting
        this.primaryColor = color;
        this.darkColor = ColorUtil.darkenColor(this.primaryColor);
        this.lightColor = ColorUtil.lightenColor(this.primaryColor);

        this.spawn(positions);
    }

    spawn(positions: Position[]) {
        this.targetPositions = positions;

        // create the body
        this.body = this.scene.physics.add.group();
        this.lockedSegments = this.scene.physics.add.group();

        this.appendSegmentsByPositions(0, this.targetPositions);

        this.head = this.body.getFirst(true) as Phaser.Physics.Arcade.Sprite; // Update the head reference

        // create the face
        this.face = this.scene.physics.add.sprite(this.head.x, this.head.y, "snake_face");
        this.face.setScale(SNAKE_STARTING_SCALE.default);
        this.face.setDepth(2);
        this.face.setOrigin(0.5, 0.5)
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // create the headGroup
        this.headGroup = this.scene.physics.add.group();
        this.headGroup.add(this.head);
        this.headGroup.add(this.face);
    }

    destroy() {
        log.debug("destroying snake", this.playerId);
        this.body.clear(true, true);
        this.lockedSegments.clear(true, true);
        this.targetPositions = [];
        this.lastPositions = [];

        if (this.head) {
            this.head.destroy(true);
            this.head = null;
        }

        if (this.face) {
            this.face.destroy(true);
            this.face = null;
        }

        if (this.headGroup) {
            this.headGroup.clear(true, true);
            this.headGroup = null;
        }
    }

    private updateFacePosition() {
        if (!this.head) return; // no update of face when head is not available

        log.trace("updateFacePosition", this.head);
        this.face.setPosition(this.head.x, this.head.y);
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));
    }

    getBody() {
        return this.body.getChildren();
    }

    getPlayerId() {
        return this.playerId;
    }

    getHead(): Phaser.Physics.Arcade.Sprite {
        return this.head;
    }

    getHeadPosition(): Position {
        if (!this.head) return null;
        return new Position(this.head.x, this.head.y, false, this.head.rotation);
    }

    getBodyPositions(): Position[] {
        return this.getBody().map((segment: Phaser.Physics.Arcade.Sprite) => {
            return new Position(segment.x, segment.y, this.lockedSegments.contains(segment), segment.rotation);
        });
    }

    getDirection() {
        return this.direction;
    }

    getStatus(): PlayerStatusEnum {
        return this.status;
    }

    setStatus(status: PlayerStatusEnum) {
        this.status = status;
    }

    getScore() {
        return this.score;
    }

    checkCollisions(): { selfCollision: boolean, worldCollision: boolean } {
        return {
            selfCollision: this.hasSelfCollision(),
            worldCollision: this.hasWorldCollision(),
        };
    }

    update(): void {
        if (this.status !== PlayerStatusEnum.ALIVE) return; // no update when snake is not alive

        log.trace("updating snake", this.playerId, this.status);
        this.moveBodyParts(); // move the body parts since the head is moving automatically by phaser

        // update the head direction
        const directionVector = DirectionUtil.getDirectionVector(this.direction);
        this.headGroup.setVelocity(directionVector.x * this.speed, directionVector.y * this.speed);
        this.head.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // make face follow the direction
        this.updateFacePosition();

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

    changeScaleBy(value: number): void {
        const newScale = this.scale + value;
        if (newScale <= 0) {
            throw new Error("new scale must be greater 0");
        }
        this.scale = newScale;
        this.updateScaling();
    }

    updateScaling(): void {
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];

        for (let segment of bodyParts) {
            segment.setScale(this.scale);
        }
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
        const spawnPos: Position = new Position(this.head.x, this.head.y, true, this.head.rotation);
        for (let i = 0; i < currentLength; i++) {
            this.addSegmentToBody(spawnPos);
        }
    }

    increase() {
        const spawnPos: Position = new Position(this.head.x, this.head.y, true, this.head.rotation);
        this.addSegmentToBody(spawnPos);
    }

    reverseDirection(): void {
        this.direction = DirectionUtil.getOppositeDirection(this.direction);

        // fix face rotation for new direction
        this.face.setRotation(DirectionUtil.getRotationAngle(this.direction));

        // set justReversed to true, to temp. disable self collision detection
        this.justReversed = true;
    }

    die() {
        this.status = PlayerStatusEnum.DEAD;
        this.headGroup.setVelocity(0, 0);
        this.destroy();
        log.trace("playerSnake died", this);
    }

    revive(positions: Position[]) {
        this.spawn(positions);
        this.status = PlayerStatusEnum.ALIVE;
        log.trace("playerSnake revived", this);
    }


    private hasSelfCollision(): boolean {
        log.trace(`self-collision is ${this.scene.getConfig().getSelfCollisionEnabled()}`);
        if (this.scene.getConfig().getSelfCollisionEnabled() && this.status !== PlayerStatusEnum.DEAD) {
            const headBounds = this.head.getBounds();
            const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
            for (let i = 2; i < bodyParts.length; i++) {
                if (!this.lockedSegments.contains(bodyParts[i])) { // don't check collision for locked segments
                    if (Phaser.Geom.Intersects.RectangleToRectangle(headBounds, bodyParts[i].getBounds())) {
                        log.info("self-collision detected!");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private hasWorldCollision(): boolean {
        log.trace(`world-collision is ${this.scene.getConfig().getWorldCollisionEnabled()}`);
        if (this.scene.getConfig().getWorldCollisionEnabled() && this.status !== PlayerStatusEnum.DEAD) {
            if (!Phaser.Geom.Rectangle.Contains(this.scene.physics.world.bounds, this.head.x, this.head.y)) {
                log.info("worldCollision detected!");
                return true;
            }
        }
        return false;
    }

    private addSegmentToBody(pos: Position) {
        const bodyPart = this.scene.physics.add.sprite(pos.getX(), pos.getY(), "snake_body");
        bodyPart.setScale(this.scale);
        bodyPart.setDepth(1);
        bodyPart.setTint(this.lightColor, this.lightColor, this.darkColor, this.darkColor);
        bodyPart.setRotation(pos.getRotation())
        bodyPart.body.allowDrag = false;

        if (pos.getLocked()) this.lockedSegments.add(bodyPart);

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
        this.lastPositions.unshift(new Position(this.head.x, this.head.y, false, this.head.rotation));
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

    // changed 2024-11-17 (removed complex interpolation logic)
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
                // apply interpolation to smooth the movement of the segment towards the new position
                const interpolatedX = Phaser.Math.Linear(currentSegment.x, positionB.getX(), MOVEMENT_INTERPOLATION_FACTOR);
                const interpolatedY = Phaser.Math.Linear(currentSegment.y, positionB.getY(), MOVEMENT_INTERPOLATION_FACTOR);

                // set the segment position to the interpolated position
                currentSegment.setPosition(interpolatedX, interpolatedY);
                currentSegment.setRotation(positionB.getRotation());
            }
        }
    }

    static fromPlayer(scene: GameScene, player: Player) {
        log.debug(`from player`, player);
        return new PhaserSnake(
            scene,
            player.getId(),
            player.getStatus(),
            player.getScore(),
            ColorUtil.rgbToHex(player.getColor()),
            player.getSpeed(),
            player.getScale(),
            player.getDirection(),
            player.getBodyPositions());
    }

    updateFromPlayer(player: Player) {
        log.trace("updating from player", player);

        this.status = player.getStatus();
        this.speed = player.getSpeed();
        this.score = player.getScore();
        this.direction = player.getDirection()

        // update the target positions
        this.targetPositions = player.getBodyPositions();
        this.lastUpdateTime = Date.now();

        if (this.scale != player.getScale()) {
            log.trace("updating scale from player", player);
            this.scale = player.getScale();
            this.updateScaling();
        }

        if (this.primaryColor != ColorUtil.rgbToHex(player.getColor())) {
            log.trace("updating color from player", player);
            this.setPrimaryColor(ColorUtil.rgbToHex(player.getColor()));
        }
    }

    private appendSegmentsByPositions(startPosIdx: number, positions: Position[]) {
        for (let i = startPosIdx; i < positions.length; i++) {
            this.addSegmentToBody(positions[i]);
        }
    }

    private updateLength(bodyParts: Phaser.GameObjects.Sprite[], targetPositions: Position[]) {
        const targetLength = targetPositions.length;
        const bodyLength = bodyParts.length;

        log.trace("currentLength", bodyLength, "playerBodyLength", targetLength);

        if (targetLength > bodyLength) {
            this.appendSegmentsByPositions(bodyLength, targetPositions);
        } else if (targetLength < bodyLength) {
            // Remove extra segments
            for (let i = bodyLength - 1; i >= targetLength; i--) {
                const segment = this.body.getChildren()[i] as Phaser.Physics.Arcade.Sprite;
                this.body.remove(segment, true, true);
            }
        }
    }

    interpolatePosition() {
        if (this.status != PlayerStatusEnum.ALIVE) return; // no interpolation when player is not alive

        if (!this.targetPositions || !this.body) {
            return
        }

        const elapsedTime = Date.now() - this.lastUpdateTime;
        const t = Math.min(elapsedTime / GLOBAL_SYNC_INTERVAL_IN_MILLIS, 1);

        // Update existing segments
        const bodyParts = this.body.getChildren() as Phaser.GameObjects.Sprite[];
        if (bodyParts.length !== this.targetPositions.length) {
            log.trace("bodyParts and targetPos are not the same length", bodyParts, this.targetPositions);
            this.updateLength(bodyParts, this.targetPositions)
        }

        for (let i = 0; i < bodyParts.length; i++) {
            const interpolatedX = Phaser.Math.Linear(bodyParts[i].x, this.targetPositions[i].getX(), t);
            const interpolatedY = Phaser.Math.Linear(bodyParts[i].y, this.targetPositions[i].getY(), t);
            bodyParts[i].setPosition(interpolatedX, interpolatedY);
            bodyParts[i].setRotation(this.targetPositions[i].getRotation())
        }

        this.updateFacePosition();
    }

    toJson() {
        return {
            playerId: this.playerId,
            status: this.status,
            score: this.score,
            speed: this.speed,
            scale: this.scale,
            direction: this.direction,
            primaryColor: this.primaryColor,
            body: this.body.getChildren().map((segment: Phaser.Physics.Arcade.Sprite) => ({
                x: segment.x,
                y: segment.y,
                locked: this.lockedSegments.contains(segment),
                rotation: segment.rotation,
            })),
        };
    }
}