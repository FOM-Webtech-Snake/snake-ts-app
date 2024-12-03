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
import {Player} from "../../../../shared/model/Player";
import {InputManager} from "../../input/InputManager";
import {GLOBAL_SYNC_INTERVAL_IN_MILLIS} from "../../../../shared/config/GlobalTickRate";

const log = getLogger("client.game.MultiplayerManager");

export class MultiplayerManager {

    private scene: GameScene;
    private socket: Socket;
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;
    private inputManager: InputManager;
    private lastCollisionCheck: number;

    private syncInterval: NodeJS.Timeout | null = null;

    constructor(
        scene: GameScene,
        socket: Socket,
        collectableManager: CollectableManager,
        playerManager: PlayerManager,
        inputManager: InputManager) {
        this.scene = scene;
        this.socket = socket;
        this.collectableManager = collectableManager;
        this.playerManager = playerManager;
        this.inputManager = inputManager;
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
            self.initGameSession(gameSession);
        });

        this.socket.on(SocketEvents.GameControl.SYNC_GAME_STATE, function (data: any) {
            log.debug("sync session state");
            log.trace(`session: ${data}`);
            const gameSession: GameSession = GameSession.fromData(data);
            self.syncGameSessionState(gameSession);
        });

        this.socket.on(SocketEvents.GameControl.START_GAME, () => {
            log.debug(`game started`);
            self.scene.setState(GameStateEnum.RUNNING);
        });

        this.socket.on(SocketEvents.GameControl.STATE_CHANGED, (state: GameStateEnum) => {
            log.debug(`game state change ${state}`);
            self.scene.setState(state);
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

        this.socket.on(SocketEvents.PlayerActions.PLAYER_RESPAWNED, (playerData: any) => {
            log.debug("Player respawned", playerData);
            const respawnedPlayer = Player.fromData(playerData);
            const snake = PhaserSnake.fromPlayer(this.scene, respawnedPlayer);

            if (respawnedPlayer.getId() === this.getPlayerId()) {
                this.inputManager.assignToSnake(snake);
                this.scene.cameraFollow(snake);
            }

            this.playerManager.addSnake(snake);
        });


        this.socket.on(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item: any) {
            log.debug("spawnNewItem");
            log.trace(`item: ${item}`);
            self.collectableManager.spawnCollectable(item);
        });

        this.socket.on(SocketEvents.SessionState.LEFT_SESSION, function (playerId: string) {
            log.debug("player disconnected", playerId);
            self.playerManager.removePlayer(playerId);
        })

        this.socket.on(SocketEvents.SessionState.DISCONNECTED, function (playerId: string) {
            log.debug("player disconnected", playerId);
            self.playerManager.removePlayer(playerId);
        });

        this.emitGetConfiguration();
    }

    public getPlayerId(): string {
        return this.socket.id;
    }

    private initGameSession(session: GameSession) {
        log.debug("initializing game session");
        this.scene.loadGameConfig(session.getConfig());
        this.scene.setState(session.getGameState());
        this.initSnakes(session.getPlayersAsArray());
    }

    private syncGameSessionState(session: GameSession) {
        log.trace("updating game from game session", session);
        // TODO change config while playing?
        this.updateSnakes(session.getPlayersAsArray());
        this.scene.setState(session.getGameState());
    }

    private initSnakes(players: Player[]) {
        log.debug("initializing snakes", players);
        if (players.length > 0) {
            players.forEach((player: Player) => {
                const snake = PhaserSnake.fromPlayer(this.scene, player);
                this.playerManager.addSnake(snake);
                if (snake.getPlayerId() === this.getPlayerId()) {
                    this.inputManager.assignToSnake(snake);
                    this.scene.cameraFollow(snake);
                }
            })
        }
    }

    private updateSnakes(players: Player[]) {
        log.trace("updating snakes", players);
        if (players.length > 0) {
            players.forEach((player: Player) => {
                const localPlayerCopy = this.playerManager.getPlayer(player.getId());
                if (localPlayerCopy) {
                    log.trace(`player found with status: ${player.getStatus()}`);
                    if (localPlayerCopy.getPlayerId() !== this.getPlayerId()) {
                        localPlayerCopy.updateFromPlayer(player);
                    }
                }
            });
        }
    }

    private syncPlayerState() {
        log.debug("syncPlayerState");
        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (player) {
            this.emitSnake(player);
        }
    }

    public startSyncingGameState() {
        log.info("client sync job started!");
        if (this.syncInterval) {
            log.warn("Sync interval already running, skipping start.");
            return;
        }

        this.syncInterval = setInterval(() => {
            log.debug("syncPlayerState");
            this.syncPlayerState();
        }, GLOBAL_SYNC_INTERVAL_IN_MILLIS);
    }

    public stopSyncingGameState() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            log.info("client sync job stopped!");
        } else {
            log.warn("No sync interval to stop.");
        }
    }

    public handleCollisionUpdate() {
        // only check for collision every xxx milliseconds
        const now = Date.now();
        if (now - this.lastCollisionCheck < GLOBAL_SYNC_INTERVAL_IN_MILLIS) return;
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

        this.checkPlayerToPlayerCollisions(player, this.playerManager.getPlayersExcept(this.getPlayerId()));
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
        this.socket.emit(SocketEvents.GameEvents.ITEM_COLLECTED, uuid, (response: any) => {
            if (response.status) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    public emitCollision(type: CollisionTypeEnum, callback: (success: boolean) => void): void {
        log.debug(`emitting collision with ${type}`);
        this.socket.emit(SocketEvents.GameEvents.COLLISION, type, (response: any) => {
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