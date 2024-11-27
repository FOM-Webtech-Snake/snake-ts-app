import {Socket} from "socket.io-client";
import {SocketEvents} from "../../../../shared/constants/SocketEvents";
import {GameScene} from "../../scenes/GameScene";
import {GameSession} from "../../../../shared/model/GameSession";
import {PhaserSnake} from "../PhaserSnake";
import {getLogger} from "../../../../shared/config/LogConfig";
import {CollectableManager} from "./CollectableManager";
import {PlayerManager} from "./PlayerManager";
import {GameStateEnum} from "../../../../shared/constants/GameStateEnum";
import {CollisionTypeEnum} from "../../../../shared/constants/CollisionTypeEnum";
import {PlayerStatusEnum} from "../../../../shared/constants/PlayerStatusEnum";
import {SpatialGrid} from "../SpatialGrid";

const log = getLogger("client.game.MultiplayerManager");

const COLLISION_CHECK_THRESHOLD = 50; // in milliseconds

export class MultiplayerManager {

    private scene: GameScene;
    private socket: Socket;
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;
    private lastCollisionCheck: number;

    constructor(
        scene: GameScene,
        socket: Socket,
        collectableManager: CollectableManager,
        playerManager: PlayerManager) {
        this.scene = scene;
        this.socket = socket;
        this.collectableManager = collectableManager;
        this.playerManager = playerManager;
        this.lastCollisionCheck = 0;
        this.setup();
    }

    private setup() {
        const self = this;

        log.debug("setting up multiplayer");

        this.socket.on(SocketEvents.SessionState.CURRENT_SESSION, function (data: any) {
            log.debug("received session");
            log.trace(`session: ${data}`);
            const gameSession: GameSession = GameSession.fromData(data);
            self.scene.handleGameSession(gameSession);
        });

        this.socket.on(SocketEvents.GameControl.START_GAME, () => {
            log.debug(`game started`);
            self.scene.setState(GameStateEnum.RUNNING);
        });

        this.socket.on(SocketEvents.GameControl.STATE_CHANGED, (state: GameStateEnum) => {
            log.debug(`game state change ${state}`);
            self.scene.setState(state);
        });

        this.socket.on(SocketEvents.PlayerActions.PLAYER_MOVEMENT, function (snake: string) {
            log.debug("snake movement");
            log.trace(`snake: ${snake}`);
            self.handleRemoteSnake(snake);
        });

        this.socket.on(SocketEvents.GameEvents.ITEM_COLLECTED, (uuid: string) => {
            log.debug("item collected", uuid);
            self.collectableManager.removeCollectable(uuid);
        });

        this.socket.on(SocketEvents.PlayerActions.PLAYER_DIED, (playerId: string) => {
            self.playerManager.removePlayer(playerId);
            if (playerId === this.getPlayerId()) {
                self.scene.cameraFollow(self.playerManager.getFirstPlayer());
            }
        });

        this.socket.on(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item: any) {
            log.debug("spawnNewItem");
            log.trace(`item: ${item}`);
            self.collectableManager.spawnCollectable(item);
            // TODO self.scene.addCollectable(self.scene, item);
        });

        this.socket.on(SocketEvents.SessionState.DISCONNECTED, function (playerId) {
            log.debug("player disconnected", playerId);
            self.playerManager.removePlayer(playerId);
            // TODO self.scene.removePlayer(playerId);
        });

        this.socket.on(SocketEvents.GameControl.END_GAME, function () {
            log.debug("game ended");
            // self.scene.startGameOverScene();
        });

        this.socket.on(SocketEvents.GameEvents.TIMER_UPDATED, function (time) {
            log.debug("timer update", time);
            // updateTimerDisplay(self.scene.timerText, time);
        });

        this.emitGetConfiguration();
    }

    public getPlayerId(): string {
        return this.socket.id;
    }

    public handleRemoteSnake(data: any) {
        log.trace("received remote snake", data);
        const player: PhaserSnake = this.playerManager.getPlayer(data.playerId);
        if (player) {
            log.trace(`player found with status: ${player.getStatus()}`);
            this.playerManager.updatePlayer(data.playerId, data);
        } else {
            const newSnake = PhaserSnake.fromData(this.scene, data);
            this.playerManager.addPlayer(data.playerId, newSnake);
        }
    }

    public syncPlayerState() {
        log.debug("syncPlayerState");
        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (player) {
            this.emitSnake(player);
        }
    }

    public handleCollisionUpdate() {
        // only check for collision every xxx milliseconds
        const now = Date.now();
        if (now - this.lastCollisionCheck < COLLISION_CHECK_THRESHOLD) return;
        this.lastCollisionCheck = now;

        log.debug("collision update");

        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (!player) return;

        this.collectableManager.checkCollisions(player, (uuid: string) =>
            this.handleCollectableCollision(uuid, player)
        );

        const {worldCollision, selfCollision} = player.checkCollisions();
        if (worldCollision) {
            this.handlePlayerCollision(player, CollisionTypeEnum.WORLD);
        }
        if (selfCollision) {
            this.handlePlayerCollision(player, CollisionTypeEnum.SELF);
        }

        this.checkPlayerToPlayerCollisions(player, this.playerManager.getAllPlayers());
    }

    private handlePlayerCollision(player: PhaserSnake, collisionType: CollisionTypeEnum) {
        this.emitCollision(collisionType, (success) => {
            if (success) {
                player.setStatus(PlayerStatusEnum.DEAD);
            }
        });

    }

    private checkPlayerToPlayerCollisions(localPlayer: PhaserSnake, otherPlayers: PhaserSnake[]) {
        // create a spacial grip with suitable cell size
        const spatialGrid = new SpatialGrid(100);
        for (const player of otherPlayers) {
            spatialGrid.addSnake(player);
        }

        const potentialColliders = spatialGrid.getPotentialColliders(localPlayer);
        const localPlayerHead = localPlayer.getHead();

        for (const otherPlayer of potentialColliders) {
            if (otherPlayer.getPlayerId() === localPlayer.getPlayerId()) {
                continue; // skip when local player is also other player.
            }

            for (const bodyPart of otherPlayer.getBody()) {
                const bodySegment = bodyPart as Phaser.Physics.Arcade.Sprite;
                if (Phaser.Geom.Intersects.RectangleToRectangle(localPlayerHead.getBounds(), bodySegment.getBounds())) {
                    log.debug(`Player-to-player collision: ${localPlayer.getPlayerId()} collided with ${otherPlayer.getPlayerId()}`);
                    this.handlePlayerCollision(localPlayer, CollisionTypeEnum.PLAYER);
                    return; // Only handle the first collision
                }
            }
        }
    }


    public handleCollectableCollision(uuid: string, playerSnake: PhaserSnake): void {
        log.debug(`collectableCollision: ${uuid}`);
        const collectable = this.collectableManager.getCollectable(uuid);
        if (!collectable) return;

        log.debug(`emitting collectable collision ${uuid}`);
        this.emitCollect(uuid, (success) => {
            if (success) {
                collectable.applyAndDestroy(playerSnake);
            }
            this.collectableManager.removeCollectable(uuid);
        });
    }

    public emitCollect(uuid: string, callback: (success: boolean) => void): void {
        log.debug(`emitting collect ${uuid}`);
        this.socket.emit(SocketEvents.GameEvents.ITEM_COLLECTED, uuid, (response) => {
            if (response.status) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    public emitCollision(type: CollisionTypeEnum, callback: (success: boolean) => void): void {
        log.debug(`emitting collision with ${type}`);
        this.socket.emit(SocketEvents.GameEvents.COLLISION, type, (response) => {
            if (response.status) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    public emitGetConfiguration() {
        log.debug(`getting configuration`);
        this.socket.emit(SocketEvents.SessionState.GET_CURRENT_SESSION);
    }

    public emitSnake(snake: PhaserSnake) {
        log.debug(`emitting snake`);
        log.trace(`snake: ${snake}`);
        this.socket.emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake.toJson())
    }

    public emitGameStateChange(state: GameStateEnum) {
        log.debug("emitting game state change ", state);
        this.socket.emit(SocketEvents.GameControl.STATE_CHANGED, state);
    }

    public emitGameStart() {
        log.debug("emitting game start");
        this.socket.emit(SocketEvents.GameControl.START_GAME);
    }
}