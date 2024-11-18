import {SocketEvents} from "../../../shared/constants/SocketEvents";
import {Socket} from "socket.io-client";
import {GameScene} from "../scenes/GameScene";

const configureGameSceneSocket = (io: Socket, scene: GameScene) => {
    io.on(SocketEvents.Connection.DISCONNECT, function (socket) {
        console.log("disconnected", socket);
        // TODO self.scene.playerId = DEFAULT_PLAYER_1_ID;
    });

    io.on(SocketEvents.SessionState.CURRENT_SESSION, function (session) {
        console.log("currentSession", session);
        // TODO self.scene.session = session;
        // TODO if (session.players) self.handlePlayers(session.players);
        // TODO if (session.collectables) self.handleCollectables(session.collectables);
    });

    io.on(SocketEvents.SessionState.NEW_PLAYER, function (playerInfo) {
        console.log("newPlayer", playerInfo);
        // TODO self.scene.addPlayerSnake(self.scene, playerInfo);
    });

    io.on(SocketEvents.GameStatus.STARTED_GAME, function () {
        console.log("started");
        // TODO self.scene.startGame(false);
    });

    io.on(SocketEvents.GameStatus.RESUMED_GAME, function () {
        console.log("resumed game");
        // TODO self.scene.resumeGame(false);
    });

    io.on(SocketEvents.GameStatus.PAUSED_GAME, function () {
        console.log("paused game");
        // TODO self.scene.pauseGame(false);
    });

    io.on(SocketEvents.PlayerActions.PLAYER_MOVED, function (player) {
        console.log("player moved", player);
        // TODO self.scene.updateOtherPlayersMovement(player);
    });

    io.on(SocketEvents.GameEvents.COLLECTABLE_COLLECTED, function (id) {
        console.log("collectable collected", id);
        // TODO if (self.scene.collectables[id]) {
        // TODO self.scene.collectables[id].item.destroy();
        // TODO delete self.scene.collectables[id];
        // TODO }
    });

    io.on(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (item) {
        // TODO console.log("spawnNewItem", item);
        // TODO self.scene.addCollectable(self.scene, item);
    });

    io.on(SocketEvents.SessionState.DISCONNECTED, function (playerId) {
        console.log("player disconnected", playerId);
        // TODO self.scene.removePlayer(playerId);
    });
}

export default configureGameSceneSocket;