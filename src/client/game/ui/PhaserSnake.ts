import Phaser from "phaser";
import {DirectionUtil} from "../util/DirectionUtil";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {ColorUtil} from "../util/ColorUtil";
import {Position} from "../../../shared/model/Position";
import {PlayerStatusEnum} from "../../../shared/constants/PlayerStatusEnum";
import {getLogger} from "../../../shared/config/LogConfig";
import {GameScene} from "../scenes/GameScene";
import {Player} from "../../../shared/model/Player";
import {SNAKE_STARTING_SCALE} from "../../../shared/model/GameSessionConfig";
import {BORDER_WIDTH} from "../../../shared/constants/BorderWidth";

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
    private selfCollisionDetected: boolean;

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
    private path: Phaser.Math.Vector3[] = [];

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
        this.selfCollisionDetected = false;

        // store primary color and create colors for tinting
        this.primaryColor = color;
        this.darkColor = ColorUtil.darkenColor(this.primaryColor);
        this.lightColor = ColorUtil.lightenColor(this.primaryColor);

        // create the body
        this.body = this.scene.physics.add.group();
        this.lockedSegments = this.scene.physics.add.group();

        this.createHead();
        this.spawn(positions);
    }

    private createHead() {
        // create the head
        if (this.body.getChildren().length == 0) {
            this.addSegmentToBody(new Position(0, 0, true, 0));
        }
        this.head = this.body.getFirst(true) as Phaser.Physics.Arcade.Sprite; // Update the head reference
        this.head.setVisible(false);
        this.head.body.enable = false;

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

    private spawn(positions: Position[]) {
        if (!positions || positions.length === 0) {
            log.error(`cannot spawn snake: positions array is empty or undefined.`);
        } else {
            Object.values(positions).forEach(value => {
                value.setLocked(true);
            });
            this.appendSegmentsByPositions(0, positions);
        }
    }

    destroy() {
        log.debug("destroying snake", this.playerId);
        this.body.clear(true, true);
        this.lockedSegments.clear(true, true);
        this.path = [];

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
        if (!this.head || !this.face) return; // no update of face when head or face is undefined

        log.trace("updateFacePosition", this.head);
        this.face.setPosition(this.head.x, this.head.y);
        this.face.setRotation(this.head.rotation);
    }

    getVisibleBody(): Phaser.Physics.Arcade.Sprite[] {
        return this.body.getChildren()
            .filter((segment: Phaser.Physics.Arcade.Sprite) => segment.visible) as Phaser.Physics.Arcade.Sprite[];
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
        return this.getVisibleBody().map((segment: Phaser.Physics.Arcade.Sprite) => {
            return new Position(segment.x, segment.y, this.lockedSegments.contains(segment), segment.rotation);
        });
    }

    getDirection() {
        return this.direction;
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
        if (!this.isAlive()) return; // no update when snake is not alive

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
        const newScale = this.head.scale + value;
        if (SNAKE_STARTING_SCALE.min <= newScale && newScale <= SNAKE_STARTING_SCALE.max) {
            // limit scaling to min max values
            this.scale = newScale;
            this.updateScaling();
        }
    }

    private updateScaling(): void {
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];

        for (let segment of bodyParts) {
            segment.setScale(this.scale);
        }
    }

    splitInHalf(): void {
        const bodyParts = this.getVisibleBody();
        const halfLength = Math.ceil(bodyParts.length / 2);

        // remove the second half of the body
        for (let i = halfLength; i < bodyParts.length; i++) {
            const segment = bodyParts[i];
            segment.setVisible(false);
            segment.body.enable = false;
        }
    }

    doubleLength(): void {
        const currentLength = this.getVisibleBody().length;
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
        if (this.isAlive()) { // snake can only die when it's alive.
            this.status = PlayerStatusEnum.DEAD;
            this.headGroup.setVelocity(0, 0);
            this.setSegmentsVisibilityAndPhysics(false, false);
            log.trace("playerSnake died", this);
        }
    }

    revive(positions: Position[]) {
        if (!this.isAlive()) { // snake can only revive when it's not alive
            this.path = [];
            positions.forEach(position => {
                position.setLocked(true);
            });
            this.resetSnakeState(positions, true);
            this.status = PlayerStatusEnum.ALIVE;
            log.trace("playerSnake revived", this);
        }
    }

    isAlive() {
        return this.status === PlayerStatusEnum.ALIVE;
    }

    private setSegmentsVisibilityAndPhysics(visible: boolean, enablePhysics: boolean) {
        this.body.getChildren().forEach((segment: Phaser.Physics.Arcade.Sprite) => {
            segment.setVisible(visible);
            segment.body.enable = enablePhysics;
        });
        this.face.setVisible(visible);
    }

    private hasSelfCollision(): boolean {
        log.trace(`self-collision is ${this.scene.getConfig().getSelfCollisionEnabled()} and snake is justReversed=${this.justReversed}`);

        // early exit if self-collision is disabled or the player is dead
        if (!this.scene.getConfig().getSelfCollisionEnabled() || !this.isAlive()) {
            return false;
        }

        const headCircle = new Phaser.Geom.Circle(this.head.x, this.head.y, this.head.displayWidth / 2);
        const bodyParts = this.getVisibleBody();

        // start loop from the third element to skip the head and the first body part
        for (let i = 2; i < bodyParts.length; i++) {
            const segment = bodyParts[i];

            // don't check collision for locked segments
            if (this.lockedSegments.contains(segment)) {
                continue;
            }

            const segmentCircle = new Phaser.Geom.Circle(segment.x, segment.y, segment.displayWidth / 2);

            // check collision between the head and the current segment
            if (Phaser.Geom.Intersects.CircleToCircle(headCircle, segmentCircle)) {
                log.trace(`self-collision detected!, justReversed=${this.justReversed})`);

                if (this.justReversed) {
                    this.selfCollisionDetected = true;
                }
                return !this.justReversed;
            }
        }

        // reset justReversed to enable self collision again
        if (this.selfCollisionDetected) {
            log.trace(`no further collisions detected! resetting justReversed(${this.justReversed}) to false!`);
            this.selfCollisionDetected = false;
            this.justReversed = false;
        }

        return false;
    }

    private hasWorldCollision(): boolean {
        log.trace(`world-collision is ${this.scene.getConfig().getWorldCollisionEnabled()}`);
        if (!this.scene.getConfig().getWorldCollisionEnabled() || !this.isAlive()) return false;

        const bounds = this.scene.physics.world.bounds;
        if (
            this.head.x <= bounds.x + 5 + BORDER_WIDTH || // left border
            this.head.x >= bounds.x - 5 + bounds.width - BORDER_WIDTH || // right border
            this.head.y <= bounds.y + 5 + BORDER_WIDTH || // top border
            this.head.y >= bounds.y - 5 + bounds.height - BORDER_WIDTH // bottom border
        ) {
            log.debug("worldCollision detected!");
            return true;
        }

        return false;
    }

    private resetSnakeState(positions: Position[], makeVisible: boolean) {
        this.justReversed = false;
        this.selfCollisionDetected = false;

        const bodyParts = this.body.getChildren() as Phaser.GameObjects.Sprite[];
        positions.forEach((segment, index) => {
            if (index < bodyParts.length) {
                const bodyPart: Phaser.Physics.Arcade.Sprite = bodyParts[index] as Phaser.Physics.Arcade.Sprite;
                bodyPart.setVisible(makeVisible);
                bodyPart.body.enable = makeVisible;
                bodyPart.setPosition(segment.getX(), segment.getY());
                bodyPart.setRotation(segment.getRotation())

                if (segment.getLocked() && !this.lockedSegments.contains(bodyPart)) {
                    this.lockedSegments.add(bodyPart);
                } else if (!segment.getLocked() && this.lockedSegments.contains(bodyPart)) {
                    this.lockedSegments.remove(bodyPart);
                }
            } else {
                this.addSegmentToBody(segment);
            }
        });

        this.face.setVisible(makeVisible);

        // remove extra body parts if needed
        for (let i = positions.length; i < bodyParts.length; i++) {
            const extraSegment = bodyParts[i] as Phaser.Physics.Arcade.Sprite;
            extraSegment.setVisible(false);
            extraSegment.body.enable = false;
            this.lockedSegments.remove(extraSegment);
        }

    }

    private addSegmentToBody(pos: Position): Phaser.Physics.Arcade.Sprite {
        // check if there are any invisible segments available to reuse
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];

        const invisibleSegment = bodyParts.find(segment => !segment.visible);
        if (invisibleSegment) {
            invisibleSegment.setVisible(true);
            invisibleSegment.body.enable = true;
            invisibleSegment.setPosition(pos.getX(), pos.getY());
            invisibleSegment.setRotation(pos.getRotation());

            if (pos.getLocked()) this.lockedSegments.add(invisibleSegment);
            return invisibleSegment;
        } else {
            // if no invisible segments are available, create a new one
            const bodyPart = this.scene.physics.add.sprite(pos.getX(), pos.getY(), "snake_body");
            bodyPart.setScale(this.scale);
            bodyPart.setDepth(1);
            bodyPart.setTint(this.lightColor, this.lightColor, this.darkColor, this.darkColor);
            bodyPart.setRotation(pos.getRotation())
            bodyPart.body.allowDrag = false;
            this.body.add(bodyPart);

            if (pos.getLocked()) this.lockedSegments.add(bodyPart);
            return bodyPart;
        }
    }

    private unlockDirection() {
        this.directionLock = false;
    }

    private lockDirection() {
        this.directionLock = true;
    }

    private saveCurrentHeadCoordinates(): void {
        // Save key position only when direction changes or head moves a significant distance
        const lastPosition = this.path[0]; // access the most recent position
        const currentHeadPosition = new Phaser.Math.Vector3(this.head.x, this.head.y, this.head.rotation);

        if (!lastPosition || lastPosition.distance(currentHeadPosition) > 1) {
            this.path.unshift(currentHeadPosition); // add new position to the beginning of the array
        }
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
        if (this.path.length > minPositionsNeeded) {
            // remove all excess positions from the end of the array
            this.path = this.path.slice(0, minPositionsNeeded);
        }
    }

    // changed 2024-11-17 (removed complex interpolation logic)
    private moveBodyParts() {
        // get all body parts as an array
        const bodyParts = this.body.getChildren() as Phaser.Physics.Arcade.Sprite[];
        const segmentSpacing: number = Math.round(this.head.displayWidth);

        this.processLockedSegments(bodyParts);

        // loop through each segment of the body, skipping the head (index 0)
        for (let i = 1; i < bodyParts.length; i++) {
            if (this.lockedSegments.contains(bodyParts[i])) continue;

            const targetDistance = segmentSpacing * i;
            let accumulatedDistance = 0;

            for (let j = 1; j < this.path.length; j++) {
                const p1 = this.path[j - 1];
                const p2 = this.path[j];
                const segmentDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);

                if (accumulatedDistance + segmentDistance >= targetDistance) {
                    const t = (targetDistance - accumulatedDistance) / segmentDistance;
                    bodyParts[i].setPosition(
                        Phaser.Math.Linear(p1.x, p2.x, t),
                        Phaser.Math.Linear(p1.y, p2.y, t)
                    );
                    bodyParts[i].setRotation(Phaser.Math.Linear(p1.z, p2.z, t));
                    break;
                }

                accumulatedDistance += segmentDistance;
            }
        }
    }

    private processLockedSegments(bodyParts: Phaser.Physics.Arcade.Sprite[]) {
        for (let i = 1; i < bodyParts.length; i++) {
            if (this.lockedSegments.contains(bodyParts[i])) {
                let isOverlapping = false;
                for (let k = 0; k < i; k++) {
                    const smallerSegment = bodyParts[k];
                    if (Phaser.Geom.Intersects.RectangleToRectangle(bodyParts[i].getBounds(), smallerSegment.getBounds())) {
                        isOverlapping = true;
                        break;
                    }
                }
                if (!isOverlapping) {
                    this.lockedSegments.remove(bodyParts[i], false, false);
                }
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
        this.direction = player.getDirection();

        // update body parts to match the new positions
        this.resetSnakeState(player.getBodyPositions(), this.isAlive());

        this.updateFacePosition();

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

    toJson() {
        return {
            playerId: this.playerId,
            status: this.status,
            score: this.score,
            speed: this.speed,
            scale: this.scale,
            direction: this.direction,
            primaryColor: this.primaryColor,
            body: this.getVisibleBody()
                .map((segment: Phaser.Physics.Arcade.Sprite) => ({
                    x: segment.x,
                    y: segment.y,
                    locked: this.lockedSegments.contains(segment),
                    rotation: segment.rotation,
                })),
        };
    }
}