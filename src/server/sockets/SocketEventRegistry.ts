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
import {GLOBAL_SYNC_INTERVAL_IN_MILLIS} from "../../shared/config/GlobalTickRate";
import {PositionUtil} from "../util/PositionUtil";
import {Position} from "../../shared/model/Position";

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

const SocketEventRegistry: {
    [Event in keyof EventHandlers]: HandlerFn<Event>;
} = {
    [SocketEvents.Connection.CREATE_SESSION]: async (
        io: Server,
        socket: Socket,
        [playerData, callback]: [any, (session: any) => void]
    ) => {
        playerData.id = socket.id;

        const player = Player.fromData(playerData);
        player.setRole(PlayerRoleEnum.HOST);

        let gameSession: GameSession = sessionManager.createSession(
            DEFAULT_GAME_SESSION_CONFIG
        );

        log.trace("parsed player from data", player);

        socket.join(gameSession.getId());
        gameSession = sessionManager.joinSession(gameSession.getId(), player);

        log.info(`created new game session: ${gameSession.getId()} by ${socket.id}`);
        callback(gameSession.toJson());
    },

    [SocketEvents.Connection.JOIN_SESSION]: async (
        io: Server,
        socket: Socket,
        [sessionId, playerData, callback]: [string, any, (session: any) => void]
    ) => {
        playerData.id = socket.id;

        const player = Player.fromData(playerData);
        player.setRole(PlayerRoleEnum.GUEST);

        try {
            const gameSession = sessionManager.joinSession(sessionId, player);
            socket.join(gameSession.getId());
            log.info(`player ${socket.id} joined session ${sessionId}`);
            callback(gameSession.toJson());
            io.to(gameSession.getId()).emit(SocketEvents.SessionState.PLAYER_JOINED, player.toJson());
        } catch (error: any) {
            callback({error: error.message})
            return;
        }
    },

    [SocketEvents.SessionState.CONFIG_UPDATED]: async (
        io: Server,
        socket: Socket,
        [configData]: [any]
    ) => {

        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        if (gameSession.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {
            gameSession.setConfig(GameSessionConfig.fromData(configData));
        }

        log.debug(`player ${socket.id} updated config ${configData}`);
        io.to(gameSession.getId()).emit(SocketEvents.SessionState.CONFIG_UPDATED, gameSession.getConfig().toJson());
    },

    [SocketEvents.GameControl.START_GAME]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        if (gameSession.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {
            if (gameSession.start(io)) {
                io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
            }
        }

        // start timer
        if (!gameSession.getTimerInterval()) {
            const intervalId = setInterval(() => {
                if (gameSession.getGameState() === GameStateEnum.RUNNING) {
                    const remainingTime = gameSession.getRemainingTime() - 1;
                    gameSession.setRemainingTime(remainingTime);

                    log.debug("remaining time", remainingTime);
                    io.to(gameSession.getId()).emit(SocketEvents.GameEvents.TIMER_UPDATED, remainingTime);

                    if (remainingTime <= 0) {
                        // stop timer
                        clearInterval(intervalId);
                        gameSession.setTimerInterval(null);
                        gameSession.setGameState(GameStateEnum.GAME_OVER);
                        io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                        log.debug("Time expired!");
                    }
                }
            }, 1000); // every one sec

            gameSession.setTimerInterval(intervalId);
        }

    },

    [SocketEvents.GameControl.STATE_CHANGED]: async (
        io: Server,
        socket: Socket,
        [state]: [GameStateEnum]
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        if (gameSession.getGameState() !== state) {
            gameSession.setGameState(state);
            io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, state);
        }
    },

    [SocketEvents.PlayerActions.PLAYER_MOVEMENT]: async (
        io: Server,
        socket: Socket,
        [snake]: [any]
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        const player = gameSession.getPlayer(socket.id);
        if (player) {
            log.trace('player moved', snake);
            player.updateFromSnakeData(snake);
        }
    },

    [SocketEvents.GameControl.GET_READY]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }
        if (gameSession.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {
            if (gameSession.isWaitingForPlayers()) {
                gameSession.spawnPlayers();
                io.to(gameSession.getId()).timeout(5000).emit(SocketEvents.GameControl.GET_READY, (err: any) => {
                    if (err) {
                        log.warn(`Not all clients responded in time for session ${gameSession.getId()}`);
                    } else {
                        log.debug(`game session start confirmed from all clients`);
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
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }
        // todo store that a player got the config / session to start
        socket.emit(SocketEvents.SessionState.CURRENT_SESSION, gameSession.toJson());
    },

    [SocketEvents.GameEvents.ITEM_COLLECTED]: async (
        io: Server,
        socket: Socket,
        [uuid, callback]: [string, (response: { status: boolean }) => void]
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        const collectable = gameSession?.getCollectableById(uuid);
        if (collectable) {
            gameSession.getPlayer(socket.id)?.addScore(childCollectables[collectable.getType()].value);
            gameSession.removeCollectable(uuid);
            callback({status: true});
            io.to(gameSession.getId()).emit(SocketEvents.GameEvents.ITEM_COLLECTED, uuid);
        } else {
            callback({status: false});
        }
    },


    [SocketEvents.GameEvents.COLLISION]: async (
        io: Server,
        socket: Socket,
        [type, callback]: [CollisionTypeEnum, (response: { status: boolean }) => void]
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        const player = gameSession.getPlayer(socket.id);
        if (!player) return;

        if ((type === CollisionTypeEnum.WORLD && gameSession.getConfig().getWorldCollisionEnabled()) ||
            (type === CollisionTypeEnum.SELF && gameSession.getConfig().getSelfCollisionEnabled()) ||
            (type === CollisionTypeEnum.PLAYER && gameSession.getConfig().getPlayerToPlayerCollisionEnabled())) {
            callback({status: true});
            player.setStatus(PlayerStatusEnum.DEAD);
            io.to(gameSession.getId()).emit(SocketEvents.PlayerActions.PLAYER_DIED, socket.id);

            // Respawn the player after a set amount of time
            if (gameSession.getConfig().getRespawnAfterDeathEnabled()) {
                setTimeout(() => {
                    if (gameSession.getGameState() === GameStateEnum.RUNNING) {
                        player.setStatus(PlayerStatusEnum.ALIVE);
                        player.setSpeed(gameSession.getConfig().getSnakeStartingSpeed());
                        player.setScale(gameSession.getConfig().getSnakeStartingScale());
                        const bodyPositions: Position[] = [];
                        const spawnPosition = PositionUtil.randomUniquePosition(gameSession);
                        for (let i = 0; i < gameSession.getConfig().getSnakeStartingLength(); i++) {
                            bodyPositions.push(spawnPosition);
                        }
                        player.setBodyPositions(bodyPositions);
                        io.to(gameSession.getId()).emit(SocketEvents.PlayerActions.PLAYER_RESPAWNED, player.toJson());
                    }
                }, 10000); // Respawn time // TODO make configurable
            } else {
                // end game when zero players are alive
                if (gameSession.countPlayersWithStatus(PlayerStatusEnum.ALIVE) === 0) {
                    gameSession.setGameState(GameStateEnum.GAME_OVER);
                    io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                    log.info("all players dead!");
                }
            }

        } else {
            callback({status: false});
        }
    },

    [SocketEvents.Connection.LEAVE_SESSION]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        if (gameSession) {
            gameSession.removePlayer(socket.id);
            socket.leave(gameSession.getId());

            if (!gameSession.hasPlayers()) {
                sessionManager.deleteSession(gameSession.getId());
            } else {
                io.to(gameSession.getId()).emit(SocketEvents.SessionState.LEFT_SESSION, socket.id);
            }
        }
    },

    [SocketEvents.Connection.DISCONNECT]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        gameSession.removePlayer(socket.id);
        if (!gameSession.hasPlayers()) {
            sessionManager.deleteSession(gameSession.getId());
        } else {
            io.to(gameSession.getId()).emit(SocketEvents.SessionState.DISCONNECTED, socket.id);
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
    }, GLOBAL_SYNC_INTERVAL_IN_MILLIS); // Sync every 100ms or adjust as needed
}


export default SocketEventRegistry;
