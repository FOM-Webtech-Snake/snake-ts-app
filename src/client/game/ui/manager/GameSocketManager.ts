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
import {registerPhaserEvent} from "../../../socket/socketRouter";
import socket from "../../../socket/socket";

const log = getLogger("client.game.GameSocketManager");

export class GameSocketManager {

    private scene: GameScene;
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;
    private inputManager: InputManager;
    private lastCollisionCheck: number;

    private syncInterval: NodeJS.Timeout | null = null;

    constructor(
        scene: GameScene,
        collectableManager: CollectableManager,
        playerManager: PlayerManager,
        inputManager: InputManager) {
        this.scene = scene;
        this.collectableManager = collectableManager;
        this.playerManager = playerManager;
        this.inputManager = inputManager;
        this.lastCollisionCheck = 0;
        this.setup();
    }

    private setup() {
        const self = this;

        log.debug("setting up multiplayer");

        registerPhaserEvent(SocketEvents.SessionState.CURRENT_SESSION, function (data: any) {
            const gameSession: GameSession = GameSession.fromData(data);
            self.initGameSession(gameSession);
        });

        registerPhaserEvent(SocketEvents.GameControl.SYNC_GAME_STATE, function (data: any) {
            const gameSession: GameSession = GameSession.fromData(data);
            self.syncGameSessionState(gameSession);
        });

        registerPhaserEvent(SocketEvents.GameControl.START_GAME, () => {
            self.scene.setState(GameStateEnum.RUNNING);
        });

        registerPhaserEvent(SocketEvents.GameControl.STATE_CHANGED, (state: GameStateEnum) => {
            self.scene.setState(state);
        });

        registerPhaserEvent(SocketEvents.GameEvents.ITEM_COLLECTED, (uuid: string) => {
            self.collectableManager.removeCollectable(uuid);
        });

        registerPhaserEvent(SocketEvents.PlayerActions.PLAYER_DIED, (playerId: string) => {
            const player = self.playerManager.getPlayer(playerId);
            if (player) {
                player.die();
                if (playerId === this.getPlayerId()) {
                    self.scene.cameraFollow(self.playerManager.getFirstPlayer());
                }
            }
        });

        registerPhaserEvent(SocketEvents.PlayerActions.PLAYER_RESPAWNED, (playerData: any) => {
            const respawnedPlayer = Player.fromData(playerData);

            log.trace("respawning player", respawnedPlayer);
            const player = self.playerManager.getPlayer(respawnedPlayer.getId());
            if (player) {
                player.revive(respawnedPlayer.getBodyPositions());
                player.updateFromPlayer(respawnedPlayer);
                if (respawnedPlayer.getId() === this.getPlayerId()) {
                    self.scene.cameraFollow(player);
                }
            }
        });


        registerPhaserEvent(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item: any) {
            self.collectableManager.spawnCollectable(item);
        });

        registerPhaserEvent(SocketEvents.SessionState.LEFT_SESSION, function (playerId: string) {
            self.playerManager.removePlayer(playerId);
        })

        registerPhaserEvent(SocketEvents.SessionState.DISCONNECTED, function (playerId: string) {
            self.playerManager.removePlayer(playerId);
        });

        registerPhaserEvent(SocketEvents.GameControl.COUNTDOWN_UPDATED, (countdown: number) => {
            const overlay = this.scene.getOverlay();
            if (countdown > 0) {
                overlay.show(`Starting in ${countdown}...`);
            } else {
                overlay.hide();
            }
        });

        this.emitGetConfiguration();
    }

    public getPlayerId(): string {
        return socket.id;
    }

    private initGameSession(session: GameSession) {
        this.scene.loadGameConfig(session.getConfig());
        this.scene.setState(session.getGameState());
        this.initSnakes(session.getPlayersAsArray());
    }

    private syncGameSessionState(session: GameSession) {
        // TODO change config while playing?
        this.updateSnakes(session.getPlayersAsArray());
        this.scene.setState(session.getGameState());
    }

    private initSnakes(players: Player[]) {
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
        if (players.length > 0) {
            players.forEach((player: Player) => {
                const localPlayer = this.playerManager.getPlayer(player.getId());
                if (localPlayer) {
                    log.trace(`player found with status: ${player.getStatus()}`);
                    if (localPlayer.getPlayerId() !== this.getPlayerId()) {
                        localPlayer.updateFromPlayer(player);
                    }
                }
            });
        }
    }

    private syncPlayerState() {
        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (player) {
            this.emitSnake(player);
        }
    }

    public startSyncingGameState() {
        log.debug("client sync job started!");
        if (this.syncInterval) {
            log.warn("Sync interval already running, skipping start.");
            return;
        }

        this.syncInterval = setInterval(() => {
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

        const player = this.playerManager.getPlayer(this.getPlayerId());

        if (!player) return;

        // only collision check when snake is alive
        if (player.getStatus() === PlayerStatusEnum.ALIVE) {
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
            // only add players that are alive to collision checks
            if (player.getStatus() === PlayerStatusEnum.ALIVE) {
                spatialGrid.addSnake(player);
            }
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
                    this.handlePlayerCollision(localPlayer, CollisionTypeEnum.PLAYER);
                    return; // Only handle the first collision
                }
            }
        }
    }


    public handleCollectableCollision(uuid: string, playerSnake: PhaserSnake): void {
        const collectable = this.collectableManager.getCollectable(uuid);
        if (!collectable) return;
        this.emitCollect(uuid, (success) => {
            if (success) {
                collectable.applyAndDestroy(playerSnake);
            }
            this.collectableManager.removeCollectable(uuid);
        });
    }

    public emitCollect(uuid: string, callback: (success: boolean) => void): void {
        socket.emitWithLog(SocketEvents.GameEvents.ITEM_COLLECTED, uuid, (response: any) => {
            if (response.status) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    public emitCollision(type: CollisionTypeEnum, callback: (success: boolean) => void): void {
        socket.emitWithLog(SocketEvents.GameEvents.COLLISION, type, (response: any) => {
            if (response.status) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    public emitGetConfiguration() {
        socket.emitWithLog(SocketEvents.SessionState.GET_CURRENT_SESSION, {});
    }

    public emitSnake(snake: PhaserSnake) {
        socket.emitWithLog(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake.toJson())
    }

    public emitGameStateChange(state: GameStateEnum) {
        socket.emitWithLog(SocketEvents.GameControl.STATE_CHANGED, state);
    }

    public emitGameStart() {
        socket.emitWithLog(SocketEvents.GameControl.START_GAME, {});
    }
}