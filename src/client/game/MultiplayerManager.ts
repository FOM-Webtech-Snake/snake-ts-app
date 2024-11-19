import {Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameScene} from "./scenes/GameScene";
import {GameSession} from "../../shared/GameSession";
import {Snake} from "./ui/Snake";

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
            const gameSession = GameSession.fromJson(session);
            self.scene.handleGameSession(gameSession);
        });

        this.socket.on(SocketEvents.Connection.DISCONNECT, function (socket) {
            console.log("disconnected", socket);
            // TODO self.scene.playerId = DEFAULT_PLAYER_1_ID;
        });

        this.socket.on(SocketEvents.SessionState.NEW_PLAYER, function (playerInfo) {
            console.log("newPlayer", playerInfo);
            // TODO self.scene.addPlayerSnake(self.scene, playerInfo);
        });

        this.socket.on(SocketEvents.GameControl.START_GAME, function () {
            console.log("game started");
            // TODO self.scene.startGame(false);
        });

        this.socket.on(SocketEvents.GameStatus.RESUMED_GAME, function () {
            console.log("resumed game");
            // TODO self.scene.resumeGame(false);
        });

        this.socket.on(SocketEvents.GameStatus.PAUSED_GAME, function () {
            console.log("paused game");
            // TODO self.scene.pauseGame(false);
        });

        this.socket.on(SocketEvents.PlayerActions.PLAYER_MOVEMENT, function (player) {
            console.log("player movement", player);
            // TODO self.scene.updateOtherPlayersMovement(player);
        });

        this.socket.on(SocketEvents.GameEvents.COLLECTABLE_COLLECTED, function (id) {
            console.log("collectable collected", id);
            // TODO if (self.scene.collectables[id]) {
            // TODO self.scene.collectables[id].item.destroy();
            // TODO delete self.scene.collectables[id];
            // TODO }
        });

        this.socket.on(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item) {
            // TODO console.log("spawnNewItem", item);
            // TODO self.scene.addCollectable(self.scene, item);
        });

        this.socket.on(SocketEvents.SessionState.DISCONNECTED, function (playerId) {
            console.log("player disconnected", playerId);
            // TODO self.scene.removePlayer(playerId);
        });

        this.emitGetConfiguration();
    }

    private emitGetConfiguration() {
        this.socket.emit(SocketEvents.SessionState.GET_CURRENT_SESSION);
    }

    public emitSnake(snake: Snake){
        this.socket.emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake.toJson())
    }
}