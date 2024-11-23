import {Server, Socket} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {sessionManager} from "../SessionManager";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {Player} from "../../shared/Player";
import {GameSession} from "../../shared/GameSession";
import {getLogger} from "../../shared/config/LogConfig";
import {DEFAULT_GAME_SESSION_CONFIG} from "../../shared/GameSessionConfig";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";

const log = getLogger("server.sockets.SocketEventRegistry");

interface EventHandlers {
    [SocketEvents.Connection.CREATE_SESSION]: [string];
    [SocketEvents.Connection.JOIN_SESSION]: [string, string];
    [SocketEvents.GameControl.GET_READY]: [];
    [SocketEvents.SessionState.GET_CURRENT_SESSION]: []
    [SocketEvents.GameControl.START_GAME]: [];
    [SocketEvents.GameControl.STATE_CHANGED]: [GameStateEnum];
    [SocketEvents.PlayerActions.PLAYER_MOVEMENT]: [string];
    [SocketEvents.GameEvents.ITEM_COLLECTED]: [string, (response: { status: string }) => void];
    [SocketEvents.Connection.LEAVE_SESSION]: [];
    [SocketEvents.Connection.DISCONNECT]: [];
}

// Map event names to handler functions
export type HandlerFn<Event extends keyof EventHandlers> = (
    io: Server,
    socket: Socket,
    args: EventHandlers[Event]
) => void;

const SocketEventRegistry: {
    [Event in keyof EventHandlers]: HandlerFn<Event>;
} = {
    [SocketEvents.Connection.CREATE_SESSION]: async (
        io: Server,
        socket: Socket,
        [playerName]: [string]
    ) => {
        const player = new Player(socket.id, playerName, PlayerRoleEnum.HOST);
        const gameSession: GameSession = sessionManager.createSession(
            socket.id,
            DEFAULT_GAME_SESSION_CONFIG
        );

        gameSession.addPlayer(player);
        socket.join(gameSession.getId());

        log.info(`created new game session: ${gameSession.getId()} by ${socket.id}`);
        io.to(gameSession.getId()).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
    },

    [SocketEvents.Connection.JOIN_SESSION]: async (
        io: Server,
        socket: Socket,
        [sessionId, playerName]: [string, string]
    ) => {
        const player = new Player(socket.id, playerName, PlayerRoleEnum.GUEST);
        const gameSession = sessionManager.getSession(sessionId);
        if (!gameSession) {
            log.warn(`Session ${sessionId} not found`);
            return;
        }

        gameSession.addPlayer(player);
        socket.join(gameSession.getId());

        log.info(`player ${socket.id} joined session ${sessionId}`);
        io.to(gameSession.getId()).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
    },

    [SocketEvents.GameControl.START_GAME]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession?.getOwnerId() === socket.id && gameSession.start(io)) {
            io.to(sessionId).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
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
        [snake]: [string]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        log.trace(`Player ${socket.id} moved snake ${snake}`);
        socket.to(sessionId).emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake);
    },

    [SocketEvents.GameControl.GET_READY]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession?.getOwnerId() === socket.id && gameSession.isWaitingForPlayers()) {
            io.to(sessionId).timeout(5000).emit(SocketEvents.GameControl.GET_READY, (err: any) => {
                if (err) {
                    log.warn(`Not all clients responded in time for session ${sessionId}`);
                } else {
                    log.info(`game session start confirmed from all clients`);
                    gameSession.setGameState(GameStateEnum.READY);
                }
            });
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
        socket.emit(SocketEvents.SessionState.CURRENT_SESSION, gameSession.toJson());
    },

    [SocketEvents.GameEvents.ITEM_COLLECTED]: async (
        io: Server,
        socket: Socket,
        [uuid, callback]: [string, (response: { status: string }) => void]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);

        const collectable = gameSession?.getCollectableById(uuid);
        if (collectable) {
            gameSession.removeCollectable(io, uuid);
            callback({status: "ok"});
        } else {
            callback({status: "error"});
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
                io.to(sessionId).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
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
                    io.to(sessionId).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
                }
            }
        }
    },
};

export default SocketEventRegistry;
