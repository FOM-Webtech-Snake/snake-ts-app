import {Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameScene} from "./scenes/GameScene";
import {GameSession} from "../../shared/GameSession";
import {PhaserSnake} from "./ui/PhaserSnake";
import {getLogger} from "../../shared/config/LogConfig";
import {CollectableManager} from "./ui/manager/CollectableManager";
import {PlayerManager} from "./ui/manager/PlayerManager";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";

const log = getLogger("client.game.MultiplayerManager");

export class MultiplayerManager {

    private scene: GameScene;
    private socket: Socket;
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;

    constructor(
        scene: GameScene,
        socket: Socket,
        collectableManager: CollectableManager,
        playerManager: PlayerManager) {
        this.scene = scene;
        this.socket = socket;
        this.collectableManager = collectableManager;
        this.playerManager = playerManager;
        this.setup();
    }

    private setup() {
        const self = this;

        log.debug("setting up multiplayer");

        this.socket.on(SocketEvents.SessionState.CURRENT_SESSION, function (session: string) {
            log.debug("received session");
            log.trace(`session: ${session}`);
            const gameSession = GameSession.fromData(session);
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

        this.emitGetConfiguration();
    }

    public getPlayerId(): string {
        return this.socket.id;
    }

    public handleRemoteSnake(data: any) {
        log.trace("received remote snake", data);
        const player = this.playerManager.getPlayer(data.playerId);
        if (player) {
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
        log.debug("collision update");
        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (player) {
            this.collectableManager.update(
                player,
                this.scene.cameras.main,
                (uuid: string) => this.handleCollectableCollision(uuid, player)
            );
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
            if (response.status === "ok") {
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