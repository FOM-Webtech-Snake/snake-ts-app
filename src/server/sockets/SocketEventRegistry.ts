import {Server, Socket} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {sessionManager} from "../SessionManager";
import {Player} from "../../shared/Player";
import {GameSession} from "../../shared/GameSession";
import {getLogger} from "../../shared/config/LogConfig";
import {DEFAULT_GAME_SESSION_CONFIG} from "../../shared/GameSessionConfig";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {childCollectables} from "../../shared/config/Collectables";
import {Position} from "../../shared/model/Position";
import {CollisionTypeEnum} from "../../shared/constants/CollisionTypeEnum";
import {PlayerStatusEnum} from "../../shared/constants/PlayerStatusEnum";

const log = getLogger("server.sockets.SocketEventRegistry");

interface EventHandlers {
    [SocketEvents.Connection.CREATE_SESSION]: [any];
    [SocketEvents.Connection.JOIN_SESSION]: [string, any];
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

const SocketEventRegistry: {
    [Event in keyof EventHandlers]: HandlerFn<Event>;
} = {
    [SocketEvents.Connection.CREATE_SESSION]: async (
        io: Server,
        socket: Socket,
        [playerData]: [any]
    ) => {
        //const player = new Player(socket.id, playerName, PlayerRoleEnum.HOST);
        const player = Player.fromData(playerData);
        const gameSession: GameSession = sessionManager.createSession(
            socket.id,
            DEFAULT_GAME_SESSION_CONFIG
        );

        log.info("parsed player from data", player);

        gameSession.addPlayer(player);
        socket.join(gameSession.getId());

        log.info(`created new game session: ${gameSession.getId()} by ${socket.id}`);
        io.to(gameSession.getId()).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
    },

    [SocketEvents.Connection.JOIN_SESSION]: async (
        io: Server,
        socket: Socket,
        [sessionId, playerData]: [string, any]
    ) => {
        //const player = new Player(socket.id, playerName, PlayerRoleEnum.GUEST);
        const player = Player.fromData(playerData);
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
        [snake]: [any]
    ) => {
        const sessionId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!sessionId) return;

        const gameSession = sessionManager.getSession(sessionId);
        if (gameSession) {
            const player = gameSession.getPlayer(socket.id);
            if (player) {
                const bodyPositions: Position[] = [];
                snake.body.forEach((pos: any) => {
                    bodyPositions.push(Position.fromData(pos));
                });
                log.trace("updated bodyPositions", bodyPositions);
                player.setBodyPositions(bodyPositions);

                log.trace(`Player ${socket.id} moved snake ${snake}`);
                socket.to(sessionId).emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake);
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
            io.to(sessionId).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
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
        if (type === CollisionTypeEnum.WORLD && gameSession.getConfig().getWorldCollisionEnabled()) {
            callback({status: true});
            gameSession.getPlayer(socket.id).setStatus(PlayerStatusEnum.DEAD);
            io.to(sessionId).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
            io.to(sessionId).emit(SocketEvents.PlayerActions.PLAYER_DIED, socket.id);
        } else if (type === CollisionTypeEnum.SELF && gameSession.getConfig().getSelfCollisionEnabled()) {
            callback({status: true});
            gameSession.getPlayer(socket.id).setStatus(PlayerStatusEnum.DEAD);
            io.to(sessionId).emit(SocketEvents.SessionState.SESSION_UPDATED, gameSession.toJson());
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
