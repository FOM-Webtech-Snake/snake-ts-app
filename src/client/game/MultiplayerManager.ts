import {Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameScene} from "./scenes/GameScene";
import {GameSession} from "../../shared/GameSession";
import {Snake} from "./ui/Snake";
import {getLogger} from "../../shared/config/LogConfig";

const log = getLogger("client.game.MultiplayerManager");

export class MultiplayerManager {

    private scene: GameScene;
    private socket: Socket;

    constructor(scene: GameScene, socket: Socket) {
        this.scene = scene;
        this.socket = socket;
        this.setup();
    }

    private setup() {
        const self = this;

        this.socket.on(SocketEvents.SessionState.CURRENT_SESSION, function (session: string) {
            const gameSession = GameSession.fromData(session);
            self.scene.handleGameSession(gameSession);
        });

        this.socket.on(SocketEvents.Connection.DISCONNECT, function (socket) {
            log.info("disconnected", socket);
            // TODO self.scene.playerId = DEFAULT_PLAYER_1_ID;
        });

        this.socket.on(SocketEvents.SessionState.NEW_PLAYER, function (playerInfo) {
            log.info("newPlayer", playerInfo);
            // TODO self.scene.addPlayerSnake(self.scene, playerInfo);
        });

        this.socket.on(SocketEvents.GameStatus.RESUMED_GAME, function () {
            log.info("resumed game");
            // TODO self.scene.resumeGame(false);
        });

        this.socket.on(SocketEvents.GameStatus.PAUSED_GAME, function () {
            log.info("paused game");
            // TODO self.scene.pauseGame(false);
        });

        this.socket.on(SocketEvents.PlayerActions.PLAYER_MOVEMENT, function (snake: string) {
            log.info("snake movement", snake);
            self.scene.handleRemoteSnake(snake);
        });

        this.socket.on(SocketEvents.GameEvents.COLLECTABLE_COLLECTED, function (id) {
            log.info("collectable collected", id);
            // TODO if (self.scene.collectables[id]) {
            // TODO self.scene.collectables[id].item.destroy();
            // TODO delete self.scene.collectables[id];
            // TODO }
        });

        this.socket.on(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item: any) {
            log.info("spawnNewItem", item);
            self.scene.spawnCollectable(item);
            // TODO self.scene.addCollectable(self.scene, item);
        });

        this.socket.on(SocketEvents.SessionState.DISCONNECTED, function (playerId) {
            log.info("player disconnected", playerId);
            // TODO self.scene.removePlayer(playerId);
        });

        this.emitGetConfiguration();
    }

    public emitCollect(uuid: string) {
        this.socket.emit(SocketEvents.GameEvents.ITEM_COLLECTED, uuid);
    }

    public emitGetConfiguration() {
        this.socket.emit(SocketEvents.SessionState.GET_CURRENT_SESSION);
    }

    public emitSnake(snake: Snake) {
        this.socket.emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake.toJson())
    }
}