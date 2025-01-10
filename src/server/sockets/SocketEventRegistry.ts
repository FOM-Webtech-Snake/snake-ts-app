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
import {
    GLOBAL_HIGH_ACTIVITY_SYNC_INTERVAL_IN_MILLIS,
    GLOBAL_SYNC_INTERVAL_IN_MILLIS
} from "../../shared/config/GlobalTickRate";
import {PositionUtil} from "../util/PositionUtil";
import {Position} from "../../shared/model/Position";
import {SpawnUtil} from "../util/SpawnUtil";
import {GameTimerManager} from "../GameTimerManager";
import {RespawnTimerUtil} from "../util/RespawnTimerUtil";
import {DirectionUtil} from "../../client/game/util/DirectionUtil";

const log = getLogger("server.sockets.SocketEventRegistry");

interface EventHandlers {
    [SocketEvents.Connection.CREATE_SESSION]: [any, (session: any) => void];
    [SocketEvents.Connection.JOIN_SESSION]: [string, any, (session: any) => void];
    [SocketEvents.SessionState.CONFIG_UPDATED]: [any];
    [SocketEvents.GameControl.GET_READY]: [];
    [SocketEvents.GameControl.START_GAME]: [];
    [SocketEvents.GameControl.RESET_GAME]: [];
    [SocketEvents.GameControl.STATE_CHANGED]: [GameStateEnum];
    [SocketEvents.ClientState.READY]: [];
    [SocketEvents.PlayerActions.PLAYER_MOVEMENT]: [string];
    [SocketEvents.GameEvents.ITEM_COLLECTED]: [string, (response: { status: boolean }) => void];
    [SocketEvents.GameEvents.COLLISION]: [CollisionTypeEnum, (response: { status: boolean }) => void];
    [SocketEvents.Connection.LEAVE_SESSION]: [];
    [SocketEvents.Connection.DISCONNECT]: [];
    [SocketEvents.SessionState.PLAYER_COLOR_CHANGED]: [string];
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

        // start countdown
        const gameTimerManager = GameTimerManager.getInstance(io);

        if (gameSession.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {

            gameTimerManager.startCountdown(gameSession, () => {
                log.info("Countdown ended. Starting game timer...");
                if (gameSession.start(io)) {
                    // start game
                    io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                    log.debug(`game state for session ${gameSession.getId()} changed to ${gameSession.getGameState()}`);
                }
                //start game timer
                gameTimerManager.startGameTimer(gameSession);
            });
        }
    },

    [SocketEvents.GameControl.RESET_GAME]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        // reset session
        if (gameSession.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {
            gameSession.reset();
            io.to(gameSession.getId()).emit(SocketEvents.GameControl.RESET_GAME, gameSession.toJson());

            // reset timer
            const gameTimerManager = GameTimerManager.getInstance(io);
            gameTimerManager.stopGameTimer(gameSession);
        }
    },


    [SocketEvents.ClientState.READY]: async (
        io: Server,
        socket: Socket,
        []: []
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }
        const player = gameSession.getPlayer(socket.id);
        if (!player) return; // return if player not found

        player.setStatus(PlayerStatusEnum.ALIVE);
        log.debug("player ready and spawned");
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

        if (gameSession.getGameState() !== state && gameSession.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {
            gameSession.setGameState(state);
            io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, state);
            log.debug(`game state for session ${gameSession.getId()} changed to ${state}`);
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
                        Object.values(gameSession.getPlayers()).forEach((player: Player) => player.resetPoints());
                        log.debug(`game state for session ${gameSession.getId()} changed to ${gameSession.getGameState()}`);
                    }
                });
            }
            else {
                log.warn(`wrong GameState: ${gameSession.getGameState()}`);
            }
        }
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
            // add points in timed game mode
            if (gameSession.getConfig().getRespawnAfterDeathEnabled()) {
                gameSession.getPlayer(socket.id)?.addScore(childCollectables[collectable.getType()].value);
            }
            gameSession.removeCollectable(uuid);
            callback({status: true});
            io.to(gameSession.getId()).emit(SocketEvents.SessionState.PLAYER_LIST, gameSession.getPlayersAsArray());
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

        const player: Player = gameSession.getPlayer(socket.id);
        if (!player || player.getStatus() !== PlayerStatusEnum.ALIVE) return; // prevent triggering multiple times

        if ((type === CollisionTypeEnum.WORLD && gameSession.getConfig().getWorldCollisionEnabled()) ||
            (type === CollisionTypeEnum.SELF && gameSession.getConfig().getSelfCollisionEnabled()) ||
            (type === CollisionTypeEnum.PLAYER && gameSession.getConfig().getPlayerToPlayerCollisionEnabled()) ||
            (type === CollisionTypeEnum.OBSTACLE && gameSession.getConfig().getObstacleEnabled())) {
            callback({status: true});
            player.setStatus(PlayerStatusEnum.DEAD);
            io.to(gameSession.getId()).emit(SocketEvents.PlayerActions.PLAYER_DIED, socket.id);

            // add points in deathmatch
            if (!gameSession.getConfig().getRespawnAfterDeathEnabled()) {
                gameSession.getPlayer(socket.id)?.addScore(gameSession.countPlayersWithStatus(PlayerStatusEnum.DEAD));
            }

            if(gameSession.getConfig().getObstacleEnabled()){
                SpawnUtil.spawnNewObstacle(io, player.getHeadPosition(), gameSession);
            }

            // Respawn the player after a set amount of time
            if (gameSession.getConfig().getRespawnAfterDeathEnabled()) {
                const respawnTimer = new RespawnTimerUtil(
                    gameSession,
                    gameSession.getConfig().getRespawnTimer(),
                    () => {
                        player.setStatus(PlayerStatusEnum.ALIVE);
                        const spawnPosition = PositionUtil.randomUniquePosition(gameSession);
                        const spawnDirection = DirectionUtil.getSafeDirection(spawnPosition, gameSession.getConfig().getSize());
                        player.setDirection(spawnDirection);
                        player.setSpeed(gameSession.getConfig().getSnakeStartingSpeed());
                        player.setScale(gameSession.getConfig().getSnakeStartingScale());
                        const bodyPositions: Position[] = [];
                        for (let i = 0; i < gameSession.getConfig().getSnakeStartingLength(); i++) {
                            bodyPositions.push(spawnPosition);
                        }
                        player.setBodyPositions(bodyPositions);
                        io.to(gameSession.getId()).emit(SocketEvents.PlayerActions.PLAYER_RESPAWNED, player.toJson());
                    }
                );

                respawnTimer.start();
            } else {
                // end game when one player is alive
                if (gameSession.countPlayersWithStatus(PlayerStatusEnum.ALIVE) <= 1) {
                    gameSession.setGameState(GameStateEnum.GAME_OVER);
                    io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                    log.debug(`game state for session ${gameSession.getId()} changed to ${gameSession.getGameState()}`);
                    log.info("One player left! Ending the game!");

                    // add points in deathmatch for last player
                    if (!gameSession.getConfig().getRespawnAfterDeathEnabled()) {
                        gameSession.getAlivePlayers()[0]?.addScore(gameSession.countPlayersWithStatus(PlayerStatusEnum.DEAD) + 1);
                    }
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

    [SocketEvents.SessionState.PLAYER_COLOR_CHANGED]: async (
        io: Server,
        socket: Socket,
        [color]: [string]
    ) => {
        const gameSession = sessionManager.getSessionIdByPlayerId(socket.id);
        if (!gameSession) {
            return;
        }

        gameSession.getPlayer(socket.id).setColor(color);
        io.to(gameSession.getId()).emit(SocketEvents.SessionState.PLAYER_LIST, gameSession.getPlayersAsArray());
    },
};

export const startSyncingGameState = (io: Server) => {
    log.info("session sync job started!");
    setInterval(() => {
        log.trace("global sync triggered");
        sessionManager.getAllSessions().forEach(session => {
            if (!session.isHighActivity()) {
                syncSession(io, session);
            }
        })
    }, GLOBAL_SYNC_INTERVAL_IN_MILLIS);

    monitorHighActivitySessions(io);
}

const syncSession = (io: Server, session: GameSession) => {
    log.trace("syncing session", session.getId());
    io.to(session.getId()).emit(SocketEvents.GameControl.SYNC_GAME_STATE, session.toJson());
    io.to(session.getId()).emit(SocketEvents.SessionState.PLAYER_LIST, session.getPlayers());
}

const monitorHighActivitySessions = (io: Server) => {
    const activeTimers: Map<string, NodeJS.Timeout> = new Map();
    setInterval(() => {
        sessionManager.getAllSessions().forEach((session: GameSession) => {
            const sessionId = session.getId();
            if (session.isHighActivity()) {
                if (!activeTimers.has(sessionId)) {
                    // Start a dedicated timer for this session
                    log.info(`Starting dedicated timer for high-activity session: ${sessionId}`);
                    const timer = setInterval(() => {
                        syncSession(io, session);
                    }, GLOBAL_HIGH_ACTIVITY_SYNC_INTERVAL_IN_MILLIS);
                    activeTimers.set(sessionId, timer);
                }
            } else if (activeTimers.has(sessionId)) {
                // Stop timer if session is no longer high-activity
                log.info(`Stopping dedicated timer for session: ${sessionId}`);
                clearInterval(activeTimers.get(sessionId));
                activeTimers.delete(sessionId);
            }
        });
    }, GLOBAL_SYNC_INTERVAL_IN_MILLIS);
}

export default SocketEventRegistry;
