import {Server, Socket} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {sessionManager} from "../SessionManager";
import {Player} from "../../shared/model/Player";
import {GameSession} from "../../shared/model/GameSession";
import {getLogger} from "../../shared/config/LogConfig";
import {DEFAULT_GAME_SESSION_CONFIG, GameSessionConfig} from "../../shared/model/GameSessionConfig";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {childCollectables} from "../../shared/config/Collectables";
import {CollisionTypeEnum} from "../../shared/constants/CollisionTypeEnum";
import {PlayerStatusEnum} from "../../shared/constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";

const log = getLogger("server.sockets.SocketEventRegistry");

interface EventHandlers {
    [SocketEvents.Connection.CREATE_SESSION]: [any, (session: any) => void];
    [SocketEvents.Connection.JOIN_SESSION]: [string, any, (session: any) => void];
    [SocketEvents.SessionState.CONFIG_UPDATED]: [any];
    [SocketEvents.GameControl.GET_READY]: [];
    [SocketEvents.SessionState.GET_CURRENT_SESSION]: []
    [SocketEvents.GameControl.START_GAME]: [];
    [SocketEvents.GameControl.STATE_CHANGED]: [GameStateEnum];
    [SocketEvents.PlayerActions.PLAYER_MOVEMENT]: [string];
    [SocketEvents.GameEvents.ITEM_COLLECTED]: [string, (response: { status: boolean }) => void];
    [SocketEvents.GameEvents.COLLISION]: [CollisionTypeEnum, (response: { status: boolean }) => void];
    [SocketEvents.Connection.LEAVE_SESSION]: [];
    [SocketEvents.Connection.DISCONNECT]: [];
}

// Map event names to handler functions
export type HandlerFn<Event extends keyof EventHandlers> = (
    io: Server,
    socket: Socket,
    args: EventHandlers[Event]
) => void;

const serverTickRate = 10; // tick rate -> how many updates per second
const syncInterval = 1000 / serverTickRate; // sync interval in ms

const SocketEventRegistry: {
    [Event in keyof EventHandlers]: HandlerFn<Event>;
} = {
    [SocketEvents.Connection.CREATE_SESSION]: async (
        io: Server,
        socket: Socket,
        [playerData, callback]: [any, (session: any) => void]
    ) => {
        const player = Player.fromData(playerData);
        player.setRole(PlayerRoleEnum.HOST);

        const gameSession: GameSession = sessionManager.createSession(
            DEFAULT_GAME_SESSION_CONFIG
        );

        log.info("parsed player from data", player);

        gameSession.addPlayer(player);
        socket.join(gameSession.getId());

        log.info(`created new game session: ${gameSession.getId()} by ${socket.id}`);
        callback(gameSession.toJson());
    },

    [SocketEvents.Connection.JOIN_SESSION]: async (
        io: Server,
        socket: Socket,
        [sessionId, playerData, callback]: [string, any, (session: any) => void]
    ) => {
        const player = Player.fromData(playerData);
        player.setRole(PlayerRoleEnum.GUEST);

        const gameSession = sessionManager.getSession(sessionId);
        if (!gameSession) {
            log.warn(`Session ${sessionId} not found`);
            callback({error: "Session not found"});
            return;
        }

        log.info("current game session config", gameSession.getConfig());
        if (gameSession.getPlayerCount() < gameSession.getConfig().getMaxPlayers()) {
            gameSession.addPlayer(player);
            socket.join(gameSession.getId());

            log.info(`player ${socket.id} joined session ${sessionId}`);
            callback(gameSession.toJson());
            io.to(gameSession.getId()).emit(SocketEvents.SessionState.PLAYER_JOINED, player.toJson());
        } else {
            callback({error: "max player count reached"});
            return;
        }
    },

    [SocketEvents.SessionState.CONFIG_UPDATED]: async (
        io: Server,
        socket: Socket,
        [configData]: [any]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession.getPlayer(socket.id).getRole() === PlayerRoleEnum.HOST) {
            gameSession.setConfig(GameSessionConfig.fromData(configData));
        }

        log.info(`player ${socket.id} updated config ${configData}`);
        io.to(gameSession.getId()).emit(SocketEvents.SessionState.CONFIG_UPDATED, gameSession.getConfig().toJson());
    },

    [SocketEvents.GameControl.START_GAME]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession.getPlayer(socket.id).getRole() === PlayerRoleEnum.HOST) {
            if (gameSession.start(io)) {
                io.to(sessionId).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
            }
        }

        // Timer starten
        if (!gameSession.getTimerInterval()) {
            const intervalId = setInterval(() => {
                if (gameSession.getGameState() === GameStateEnum.RUNNING) {
                    const remainingTime = gameSession.getRemainingTime() - 1;
                    gameSession.setRemainingTime(remainingTime);

                    log.debug("remaining time", remainingTime);
                    io.to(sessionId).emit(SocketEvents.GameEvents.TIMER_UPDATED, remainingTime);

                    if (remainingTime <= 0) {
                        // Timer stoppen
                        clearInterval(intervalId);
                        gameSession.setTimerInterval(null);
                        gameSession.setGameState(GameStateEnum.GAME_OVER);
                        io.to(sessionId).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                        log.info("Time expired!");
                    }
                }
            }, 1000); // jede Sekunde

            gameSession.setTimerInterval(intervalId);
        }

    },

    [SocketEvents.GameControl.STATE_CHANGED]: async (
        io: Server,
        socket: Socket,
        [state]: [GameStateEnum]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession.getGameState() !== state) {
            gameSession.setGameState(state);
            io.to(sessionId).emit(SocketEvents.GameControl.STATE_CHANGED, state);
        }
    },

    [SocketEvents.PlayerActions.PLAYER_MOVEMENT]: async (
        io: Server,
        socket: Socket,
        [snake]: [any]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession) {
            const player = gameSession.getPlayer(socket.id);
            if (player) {
                log.trace('player moved', snake);
                player.updateFromSnakeData(snake);
            }
        }
    },

    [SocketEvents.GameControl.GET_READY]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession: GameSession = sessionManager.getSession(sessionId);
        if (gameSession.getPlayer(socket.id).getRole() === PlayerRoleEnum.HOST) {
            if (gameSession.isWaitingForPlayers()) {
                gameSession.spawnPlayers();
                io.to(sessionId).timeout(5000).emit(SocketEvents.GameControl.GET_READY, (err: any) => {
                    if (err) {
                        log.warn(`Not all clients responded in time for session ${sessionId}`);
                    } else {
                        log.info(`game session start confirmed from all clients`);
                        gameSession.setGameState(GameStateEnum.READY);
                    }
                });
            }
        }
    },

    [SocketEvents.SessionState.GET_CURRENT_SESSION]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        // todo store that a player got the config / session to start
        socket.emit(SocketEvents.SessionState.CURRENT_SESSION, gameSession.toJson());
    },

    [SocketEvents.GameEvents.ITEM_COLLECTED]: async (
        io: Server,
        socket: Socket,
        [uuid, callback]: [string, (response: { status: boolean }) => void]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        const collectable = gameSession?.getCollectableById(uuid);

        if (collectable) {
            gameSession.getPlayer(socket.id).addScore(childCollectables[collectable.getType()].value);
            gameSession.removeCollectable(uuid);
            callback({status: true});
            io.to(sessionId).emit(SocketEvents.GameEvents.ITEM_COLLECTED, uuid);
        } else {
            callback({status: false});
        }
    },


    [SocketEvents.GameEvents.COLLISION]: async (
        io: Server,
        socket: Socket,
        [type, callback]: [CollisionTypeEnum, (response: { status: boolean }) => void]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if ((type === CollisionTypeEnum.WORLD && gameSession.getConfig().getWorldCollisionEnabled()) ||
            (type === CollisionTypeEnum.SELF && gameSession.getConfig().getSelfCollisionEnabled()) ||
            (type === CollisionTypeEnum.PLAYER && gameSession.getConfig().getPlayerToPlayerCollisionEnabled())) {
            callback({status: true});
            gameSession.getPlayer(socket.id).setStatus(PlayerStatusEnum.DEAD);
            io.to(sessionId).emit(SocketEvents.PlayerActions.PLAYER_DIED, socket.id);
        } else {
            callback({status: false});
        }
    },

    [SocketEvents.Connection.LEAVE_SESSION]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession) {
            gameSession.removePlayer(socket.id);
            socket.leave(sessionId);

            if (!gameSession.hasPlayers()) {
                sessionManager.deleteSession(sessionId);
            } else {
                io.to(sessionId).emit(SocketEvents.SessionState.LEFT_SESSION, socket.id);
            }
        }
    },

    [SocketEvents.Connection.DISCONNECT]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        log.info(`User disconnected: ${socket.id}`);
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);

        if (sessionId) {
            const gameSession = sessionManager.getSession(sessionId);
            if (gameSession) {
                gameSession.removePlayer(socket.id);

                if (!gameSession.hasPlayers()) {
                    sessionManager.deleteSession(sessionId);
                } else {
                    io.to(sessionId).emit(SocketEvents.SessionState.DISCONNECTED, socket.id);
                }
            }
        }
    },
};

export const startSyncingGameState = (io: Server) => {
    log.info("session sync job started!");
    setInterval(() => {
        log.debug("syncing session states - triggered");
        // Loop over all active sessions and sync their game state
        sessionManager.getAllSessions().forEach((session) => {
            if (session.getGameState() === GameStateEnum.RUNNING) { // only send updates for running sessions
                log.trace(`sending session state ${session.getId()}`);
                const sessionId = session.getId();
                io.to(sessionId).emit(SocketEvents.GameControl.SYNC_GAME_STATE, session.toJson());
            }
        });
    }, syncInterval); // Sync every 100ms or adjust as needed
}


export default SocketEventRegistry;
