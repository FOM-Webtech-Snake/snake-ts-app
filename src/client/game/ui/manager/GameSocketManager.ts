import {SocketEvents} from "../../../../shared/constants/SocketEvents";
import {GameSession} from "../../../../shared/model/GameSession";
import {PhaserSnake} from "../PhaserSnake";
import {getLogger} from "../../../../shared/config/LogConfig";
import {GameStateEnum} from "../../../../shared/constants/GameStateEnum";
import {Player} from "../../../../shared/model/Player";
import {registerPhaserEvent} from "../../../socket/socketRouter";
import socket from "../../../socket/socket";
import {Collectable} from "../../../../shared/model/Collectable";

const log = getLogger("client.game.GameSocketManager");

export class GameSocketManager extends Phaser.Events.EventEmitter {

    constructor() {
        super();
        this.setup();
        this.emitReady();
    }

    private setup() {
        const self = this;

        log.debug("setting up multiplayer");

        registerPhaserEvent(SocketEvents.GameControl.SYNC_GAME_STATE, function (data: any) {
            const gameSession: GameSession = GameSession.fromData(data);
            self.emit("SYNC_GAME_STATE", gameSession);
        });

        registerPhaserEvent(SocketEvents.GameControl.START_GAME, () => {
            self.emit("START_GAME");
        });

        registerPhaserEvent(SocketEvents.GameControl.RESET_GAME, () => {
            self.emit("RESET_GAME");
            this.emitReady();
        });

        registerPhaserEvent(SocketEvents.GameControl.STATE_CHANGED, (state: GameStateEnum) => {
            self.emit("STATE_CHANGED", state);
        });

        registerPhaserEvent(SocketEvents.GameEvents.ITEM_COLLECTED, (uuid: string) => {
            self.emit("ITEM_COLLECTED", uuid);
        });

        registerPhaserEvent(SocketEvents.PlayerActions.PLAYER_DIED, (playerId: string) => {
            self.emit("PLAYER_DIED", playerId);
        });

        registerPhaserEvent(SocketEvents.PlayerActions.PLAYER_RESPAWNED, (playerData: any) => {
            const respawnedPlayer: Player = Player.fromData(playerData);
            self.emit("PLAYER_RESPAWNED", respawnedPlayer);
        });

        registerPhaserEvent(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, function (data: any) {
            const newCollectable: Collectable = Collectable.fromData(data);
            self.emit("SPAWN_NEW_COLLECTABLE", newCollectable);
        });

        registerPhaserEvent(SocketEvents.SessionState.LEFT_SESSION, function (playerId: string) {
            self.emit("LEFT_SESSION", playerId);
        })

        registerPhaserEvent(SocketEvents.SessionState.DISCONNECTED, function (playerId: string) {
            self.emit("DISCONNECT", playerId);
        });

        registerPhaserEvent(SocketEvents.GameControl.COUNTDOWN_UPDATED, (countdown: number) => {
            self.emit("COUNTDOWN_UPDATED", countdown);
        });
    }

    private emitReady(){
        socket.emitWithLog(SocketEvents.ClientState.READY);
    }

    public getPlayerId(): string {
        return socket.id;
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