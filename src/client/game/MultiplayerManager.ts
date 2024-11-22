import {Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameScene} from "./scenes/GameScene";
import {GameSession} from "../../shared/GameSession";
import {Snake} from "./ui/Snake";
import {getLogger} from "../../shared/config/LogConfig";
import {CollectableManager} from "./ui/CollectableManager";
import {PlayerManager} from "./ui/PlayerManager";

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

        this.socket.on(SocketEvents.SessionState.CURRENT_SESSION, function (session: string) {
            const gameSession = GameSession.fromData(session);
            self.scene.handleGameSession(gameSession);
        });

        this.socket.on(SocketEvents.SessionState.NEW_PLAYER, function (playerInfo) {
            log.debug("newPlayer", playerInfo);
            // TODO self.scene.addPlayerSnake(self.scene, playerInfo);
        });

        this.socket.on(SocketEvents.GameStatus.RESUMED_GAME, function () {
            log.debug("resumed game");
            // TODO self.scene.resumeGame(false);
        });

        this.socket.on(SocketEvents.GameStatus.PAUSED_GAME, function () {
            log.debug("paused game");
            // TODO self.scene.pauseGame(false);
        });

        this.socket.on(SocketEvents.PlayerActions.PLAYER_MOVEMENT, function (snake: string) {
            log.debug("snake movement", snake);
            self.handleRemoteSnake(snake);
        });

        this.socket.on(SocketEvents.GameEvents.ITEM_COLLECTED, (uuid: string) => {
            log.debug("item collected", uuid);
            self.collectableManager.removeCollectable(uuid);
        });

        this.socket.on(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item: any) {
            log.debug("spawnNewItem", item);
            self.collectableManager.spawnCollectable(item);
            // TODO self.scene.addCollectable(self.scene, item);
        });

        this.socket.on(SocketEvents.SessionState.DISCONNECTED, function (playerId) {
            log.info("player disconnected", playerId);
            self.playerManager.removePlayer(playerId);
            // TODO self.scene.removePlayer(playerId);
        });

        this.emitGetConfiguration();
    }

    public getPlayerId(): string {
        return this.socket.id;
    }

    public handleRemoteSnake(snakeData: string) {
        const parsedData = JSON.parse(snakeData);
        const player = this.playerManager.getPlayer(parsedData.playerId);
        if (player) {
            this.playerManager.updatePlayer(parsedData.playerId, parsedData);
        } else {
            const newSnake = Snake.fromData(this.scene, parsedData);
            this.playerManager.addPlayer(parsedData.playerId, newSnake);
        }
    }

    public syncPlayerState() {
        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (player) {
            this.emitSnake(player);
        }
    }

    public handleCollisionUpdate() {
        const player = this.playerManager.getPlayer(this.getPlayerId());
        if (player) {
            this.collectableManager.update(
                player,
                this.scene.cameras.main,
                (uuid: string) => this.handleCollectableCollision(uuid, player)
            );
        }
    }

    public handleCollectableCollision(uuid: string, playerSnake: Snake): void {
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
        this.socket.emit(SocketEvents.GameEvents.ITEM_COLLECTED, uuid, (response) => {
            if (response.status === "ok") {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    public emitGetConfiguration() {
        this.socket.emit(SocketEvents.SessionState.GET_CURRENT_SESSION);
    }

    public emitSnake(snake: Snake) {
        this.socket.emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake.toJson())
    }
}